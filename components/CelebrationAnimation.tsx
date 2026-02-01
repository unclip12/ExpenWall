import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Sparkles, Star } from 'lucide-react';

interface CelebrationAnimationProps {
  type: 'success' | 'failure';
  amount: number;
  message?: string;
  onComplete: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type,
  amount,
  message,
  onComplete
}) => {
  const [show, setShow] = useState(true);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; rotation: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate confetti particles for success
    if (type === 'success') {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -20,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3
      }));
      setConfetti(particles);
    }

    // Auto-close after animation
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }, 3500);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  const messages = {
    success: [
      `🎉 Amazing! You saved ₹${amount}!`,
      `💪 Strong willpower! ₹${amount} saved!`,
      `🌟 Fantastic! You resisted and saved ₹${amount}!`,
      `🏆 Victory! ₹${amount} stays in your wallet!`,
      `✨ Well done! That's ₹${amount} saved for something better!`
    ],
    failure: [
      `😔 You spent ₹${amount} on cravings`,
      `💸 ₹${amount} gone... But you can resist next time!`,
      `😢 ₹${amount} wasted. Try harder next time!`,
      `📉 ₹${amount} spent. Remember your goals!`
    ]
  };

  const randomMessage = message || messages[type][Math.floor(Math.random() * messages[type].length)];

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-5deg); }
          75% { transform: translateX(10px) rotate(5deg); }
        }

        .confetti-particle {
          animation: confetti-fall linear forwards;
        }

        .shake-animation {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>

      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-300"
        onClick={onComplete}
      >
        {/* Confetti Effect for Success */}
        {type === 'success' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 confetti-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  transform: `rotate(${particle.rotation}deg)`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              >
                {Math.random() > 0.5 ? (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                ) : (
                  <Star className="w-full h-full text-yellow-400 fill-yellow-400" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Animation Card */}
        <div 
          className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-500 ${
            type === 'success' 
              ? 'border-4 border-emerald-400 dark:border-emerald-500' 
              : 'border-4 border-red-400 dark:border-red-500'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon Animation */}
          <div className="flex justify-center mb-6">
            {type === 'success' ? (
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
                
                {/* Sparkles around success icon */}
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-ping" />
                <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-300 animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shake-animation">
                  <XCircle className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <h2 className={`text-3xl font-bold ${
              type === 'success' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {type === 'success' ? 'Congratulations!' : 'Oops!'}
            </h2>
            
            <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
              {randomMessage}
            </p>

            {/* Amount Display */}
            <div className={`text-5xl font-black py-4 ${
              type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {type === 'success' ? (
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-10 h-10" />
                  <span>+₹{amount}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <TrendingDown className="w-10 h-10" />
                  <span>-₹{amount}</span>
                </div>
              )}
            </div>

            {/* Motivational Subtext */}
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              {type === 'success' 
                ? "Keep it up! Every small victory counts towards your financial goals! 💪" 
                : "Don't worry! Tomorrow is a new day. You've got this! 💪"}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onComplete}
            className={`mt-6 w-full py-3 rounded-2xl font-semibold text-white transition-all ${
              type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700'
            }`}
          >
            Continue
          </button>
        </div>

        {/* Tap anywhere to close hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm animate-pulse">
          Tap anywhere to close
        </div>
      </div>
    </>
  );
};