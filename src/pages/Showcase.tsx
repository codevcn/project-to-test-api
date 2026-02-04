import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "./Showcase.scss"

type TCard = {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ["🎨", "🎮", "🎭", "🎪", "🎯", "🎸", "🎺", "🎹"]

export const Showcase = () => {
  const [cards, setCards] = useState<TCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isWon, setIsWon] = useState(false)

  function initializeGame() {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
    setCards(shuffledEmojis)
    setFlippedCards([])
    setMoves(0)
    setIsWon(false)
  }

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(prev => prev + 1)
      const [first, second] = flippedCards
      
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((card, index) => 
          index === first || index === second 
            ? { ...card, isMatched: true }
            : card
        ))
        setFlippedCards([])
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, index) => 
            index === first || index === second 
              ? { ...card, isFlipped: false }
              : card
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsWon(true)
    }
  }, [cards])

  function handleCardClick(index: number) {
    if (
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return
    }

    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, isFlipped: true } : card
    ))
    setFlippedCards(prev => [...prev, index])
  }

  return (
    <div className="showcase">
      <div className="showcase-container">
        <header className="showcase-header">
          <Link to="/" className="back-link">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          
          <div className="header-content">
            <div className="header-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="header-title">Memory Card Game</h1>
              <p className="header-subtitle">Match all pairs to win!</p>
            </div>
          </div>
        </header>

        <div className="game-info">
          <div className="info-card">
            <span className="info-label">Moves</span>
            <span className="info-value">{moves}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Pairs Found</span>
            <span className="info-value">
              {cards.filter(c => c.isMatched).length / 2} / {EMOJIS.length}
            </span>
          </div>
        </div>

        <div className="game-board">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`game-card ${card.isFlipped || card.isMatched ? "flipped" : ""} ${card.isMatched ? "matched" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="card-back">
                  <span className="card-emoji">{card.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isWon && (
          <div className="win-modal">
            <div className="modal-backdrop" onClick={initializeGame}></div>
            <div className="modal-content">
              <div className="confetti">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
                  }}></div>
                ))}
              </div>
              <svg className="w-16 h-16 win-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="win-title">Congratulations!</h2>
              <p className="win-message">You won in {moves} moves!</p>
              <button className="btn btn-primary" onClick={initializeGame}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Play Again
              </button>
            </div>
          </div>
        )}

        <button className="reset-btn" onClick={initializeGame}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Game
        </button>
      </div>
    </div>
  )
}
