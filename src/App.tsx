import './App.css'

function App() {
  return (
    <main className="coming-soon">
      <div className="coming-soon__atmosphere" aria-hidden="true">
        <div className="coming-soon__bloom" />
        <div className="coming-soon__rays" />
        <div className="coming-soon__vignette" />
        <div className="coming-soon__grain" />
      </div>

      <div className="coming-soon__stage">
        <div className="coming-soon__brand">
          <div className="coming-soon__halo" aria-hidden="true" />
          <img
            className="coming-soon__logo"
            src="/tph-symbol.png"
            alt=""
            width={200}
            height={320}
          />
          <p className="coming-soon__name">
            <span className="coming-soon__name-the">The</span>
            <span className="coming-soon__name-main">Publishers House</span>
          </p>
        </div>

        <div className="coming-soon__rule" aria-hidden="true" />

        <h1 className="coming-soon__headline">Coming Soon</h1>

        <p className="coming-soon__support">
          A teaching-focused apostolic church — accurate Word, Spirit-filled
          equipping.
        </p>
      </div>

      <p className="coming-soon__location">
        The House of Bread, Korinjoh House · Jos, Plateau State · Abuja
      </p>
    </main>
  )
}

export default App
