import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useTrades } from '@/hooks/use-trades';
import { useAccount } from '@/contexts/AccountContext';
import { AccountRequiredMessage } from '@/components/AccountRequiredMessage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Simulated price data for demonstration
const generatePriceData = (entryPrice: number, stopLoss: number, takeProfit: number, result: string) => {
  const basePrice = entryPrice;
  const data = [];
  const points = 100;
  
  for (let i = 0; i <= points; i++) {
    const progress = i / points;
    let price = basePrice;
    
    // Simulate price movement towards entry, then towards result
    if (progress < 0.3) {
      // Move towards entry
      price = basePrice + (Math.random() - 0.5) * 0.5;
    } else if (progress < 0.7) {
      // Move towards result
      const target = result === 'win' ? takeProfit : 
                   result === 'loss' ? stopLoss : entryPrice;
      price = basePrice + (target - basePrice) * ((progress - 0.3) / 0.4);
    } else {
      // Final result
      const finalPrice = result === 'win' ? takeProfit : 
                       result === 'loss' ? stopLoss : entryPrice;
      price = finalPrice;
    }
    
    data.push({
      time: i,
      price: parseFloat(price.toFixed(5)),
      isEntry: i === Math.floor(points * 0.3),
      isStop: i === points && result === 'loss',
      isTarget: i === points && result === 'win',
    });
  }
  
  return data;
};

export default function TradingReplaySimple() {
  const { hasAccounts } = useAccount();
  const { data: trades = [], isLoading } = useTrades();
  
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const winningTrades = trades.filter((t: any) => t.result === 'win');
  const losingTrades = trades.filter((t: any) => t.result === 'loss');

  useEffect(() => {
    if (selectedTrade) {
      const data = generatePriceData(
        selectedTrade.entry_price || selectedTrade.entryPrice,
        selectedTrade.stop_loss || selectedTrade.stopLoss,
        selectedTrade.take_profit || selectedTrade.takeProfit,
        selectedTrade.result
      );
      setPriceData(data);
      setCurrentFrame(0);
      setIsPlaying(false);
    }
  }, [selectedTrade]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentFrame < priceData.length - 1) {
      interval = setInterval(() => {
        setCurrentFrame(prev => Math.min(prev + playbackSpeed, priceData.length - 1));
      }, 100);
    } else if (currentFrame >= priceData.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, playbackSpeed, priceData.length]);

  const currentPrice = priceData[currentFrame]?.price || 0;
  const currentDataPoint = priceData[currentFrame];

  const handlePlayPause = () => {
    if (currentFrame >= priceData.length - 1) {
      setCurrentFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const handleSkipBack = () => {
    setCurrentFrame(prev => Math.max(0, prev - 10));
  };

  const handleSkipForward = () => {
    setCurrentFrame(prev => Math.min(priceData.length - 1, prev + 10));
  };

  if (!hasAccounts) {
    return <AccountRequiredMessage />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Replay de Trading</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600">
            {winningTrades.length} Gagnants
          </Badge>
          <Badge variant="outline" className="text-red-600">
            {losingTrades.length} Perdants
          </Badge>
        </div>
      </div>

      {/* Trade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedTrade?.id || ''}
            onValueChange={(value) => {
              const trade = trades.find((t: any) => t.id === value);
              setSelectedTrade(trade || null);
              setShowAnalysis(false);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un trade à analyser..." />
            </SelectTrigger>
            <SelectContent>
              {trades.map((trade: any) => (
                <SelectItem key={trade.id} value={trade.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.result === 'win' ? 'default' : trade.result === 'loss' ? 'destructive' : 'secondary'}>
                      {trade.result === 'win' ? 'Gagnant' : trade.result === 'loss' ? 'Perdant' : 'BE'}
                    </Badge>
                    <span>{trade.instrument}</span>
                    <span className="text-muted-foreground">
                      {(trade.entry_price || trade.entryPrice)} → {trade.result === 'win' ? (trade.take_profit || trade.takeProfit) : trade.result === 'loss' ? (trade.stop_loss || trade.stopLoss) : (trade.entry_price || trade.entryPrice)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(`${trade.trade_date} ${trade.trade_time}`), 'dd MMM HH:mm', { locale: fr })}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTrade && (
        <>
          {/* Chart Area */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>{selectedTrade.instrument}</span>
                  <Badge variant={selectedTrade.direction === 'long' ? 'default' : 'destructive'}>
                    {selectedTrade.direction === 'long' ? 'LONG' : 'SHORT'}
                  </Badge>
                </CardTitle>
                <div className="text-2xl font-mono">
                  {currentPrice.toFixed(5)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Chart Visualization */}
              <div className="h-64 bg-muted rounded-lg p-4 relative">
                <svg width="100%" height="100%" viewBox="0 0 800 240">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={`h-${i}`}
                      x1="0" y1={i * 48}
                      x2="800" y2={i * 48}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                    />
                  ))}
                  
                  {/* Price line */}
                  {priceData.length > 1 && (
                    <polyline
                      points={priceData.map((d, i) => 
                        `${(i * 8)},${240 - ((d.price - Math.min(...priceData.map(p => p.price))) / 
                        (Math.max(...priceData.map(p => p.price)) - Math.min(...priceData.map(p => p.price))) * 200 + 20)}`
                      ).join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Entry point */}
                  {currentDataPoint?.isEntry && (
                    <circle
                      cx={currentFrame * 8}
                      cy={240 - ((currentPrice - Math.min(...priceData.map(p => p.price))) / 
                       (Math.max(...priceData.map(p => p.price)) - Math.min(...priceData.map(p => p.price))) * 200 + 20)}
                      r="6"
                      fill="blue"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Current position */}
                  <circle
                    cx={currentFrame * 8}
                    cy={240 - ((currentPrice - Math.min(...priceData.map(p => p.price))) / 
                     (Math.max(...priceData.map(p => p.price)) - Math.min(...priceData.map(p => p.price))) * 200 + 20)}
                    r="4"
                    fill="currentColor"
                  />
                </svg>
              </div>
              
              {/* Trade Levels */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Entry</div>
                  <div className="text-lg font-mono">{selectedTrade.entry_price || selectedTrade.entryPrice}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Stop Loss</div>
                  <div className="text-lg font-mono text-red-500">{selectedTrade.stop_loss || selectedTrade.stopLoss}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Take Profit</div>
                  <div className="text-lg font-mono text-green-500">{selectedTrade.take_profit || selectedTrade.takeProfit}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playback Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progression</span>
                    <span>{currentFrame}/{priceData.length - 1}</span>
                  </div>
                  <Slider
                    value={[currentFrame]}
                    onValueChange={(value) => {
                      setCurrentFrame(value[0]);
                      setIsPlaying(false);
                    }}
                    max={priceData.length - 1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSkipBack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button onClick={handlePlayPause} size="sm">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSkipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Vitesse</span>
                    <span>{playbackSpeed}x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analyse du Trade</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  {showAnalysis ? 'Masquer' : 'Afficher'} l'analyse
                </Button>
              </div>
            </CardHeader>
            {showAnalysis && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Instrument:</strong> {selectedTrade.instrument}</div>
                      <div><strong>Direction:</strong> {selectedTrade.direction === 'long' ? 'Long' : 'Short'}</div>
                      <div><strong>Risque:</strong> {Math.abs((selectedTrade.entry_price || selectedTrade.entryPrice) - (selectedTrade.stop_loss || selectedTrade.stopLoss)).toFixed(5)}</div>
                      <div><strong>Reward:</strong> {Math.abs((selectedTrade.take_profit || selectedTrade.takeProfit) - (selectedTrade.entry_price || selectedTrade.entryPrice)).toFixed(5)}</div>
                      <div><strong>Ratio R/R:</strong> {(Math.abs((selectedTrade.take_profit || selectedTrade.takeProfit) - (selectedTrade.entry_price || selectedTrade.entryPrice)) / Math.abs((selectedTrade.entry_price || selectedTrade.entryPrice) - (selectedTrade.stop_loss || selectedTrade.stopLoss))).toFixed(2)}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Psychologie</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Avant le trade:</strong> {selectedTrade.emotion_before}</div>
                      <div><strong>Après le trade:</strong> {selectedTrade.emotion_after}</div>
                      <div><strong>Raison:</strong> {selectedTrade.reason}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
