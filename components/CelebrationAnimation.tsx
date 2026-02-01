import React, { useState } from 'react';
import { formatCurrency } from '../utils/transactionUtils';

interface CelebrationAnimationProps {
  type: 'success' | 'failure';
  amount: number;
  onComplete: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type,
  amount,
  onComplete
}) => {
  const isSuccess = type === 'success';
  const message = isSuccess ? 'RESISTED!' : 'GAVE IN';
  const subtitle = isSuccess 
    ? `You saved ${formatCurrency(amount)}!` 
    : `You spent ${formatCurrency(amount)}`;
  const emoji = isSuccess ? '💪🎉' : '😔💸';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* 3D Animated Text - No background box */}
      <div className="relative flex flex-col items-center justify-center px-8">
        {/* Main Message - 3D Animated Letters */}
        <div className="perspective-1000">
          <h1 
            className={`text-6xl md:text-8xl font-black tracking-wider animate-3d-bounce ${
              isSuccess 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-red-600'
            }`}
            style={{
              textShadow: isSuccess
                ? '0 10px 30px rgba(16, 185, 129, 0.5), 0 20px 60px rgba(16, 185, 129, 0.3)'
                : '0 10px 30px rgba(239, 68, 68, 0.5), 0 20px 60px rgba(239, 68, 68, 0.3)',
              transform: 'rotateX(20deg) rotateY(-5deg)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            {message.split('').map((letter, idx) => (
              <span
                key={idx}
                className="inline-block animate-letter-pop"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  display: letter === ' ' ? 'inline' : 'inline-block'
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Emoji */}
        <div 
          className="text-6xl md:text-7xl my-6 animate-bounce-slow"
          style={{
            animation: 'spin-emoji 2s ease-in-out infinite'
          }}
        >
          {emoji}
        </div>

        {/* Subtitle */}
        <p 
          className={`text-3xl md:text-4xl font-bold mb-8 animate-fade-in ${
            isSuccess ? 'text-emerald-400' : 'text-red-400'
          }`}
          style={{
            textShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
            animationDelay: '0.5s'
          }}
        >
          {subtitle}
        </p>

        {/* Done Button */}
        <button
          onClick={onComplete}
          className={`px-8 py-4 text-xl font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-110 animate-fade-in ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
              : 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700'
          }`}
          style={{
            animationDelay: '1s',
            boxShadow: isSuccess
              ? '0 10px 40px rgba(16, 185, 129, 0.4)'
              : '0 10px 40px rgba(239, 68, 68, 0.4)'
          }}
        >
          Done
        </button>

        {/* Particle Effects */}
        {isSuccess && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Global Styles for 3D Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: rotateX(20deg) rotateY(-5deg) translateY(0px); }
          50% { transform: rotateX(20deg) rotateY(-5deg) translateY(-20px); }
        }

        @keyframes letter-pop {
          0% {
            opacity: 0;
            transform: scale(0) rotateY(0deg) translateZ(0px);
          }
          50% {
            transform: scale(1.2) rotateY(180deg) translateZ(50px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(360deg) translateZ(0px);
          }
        }

        @keyframes spin-emoji {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.1); }
          75% { transform: rotate(15deg) scale(1.1); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes particle {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(calc(100px * (${Math.random() * 2 - 1})), calc(-100px * ${Math.random()})) scale(0);
          }
        }

        .animate-3d-bounce {
          animation: float 3s ease-in-out infinite;
        }

        .animate-letter-pop {
          animation: letter-pop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};