import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>🎷 Muzzajazz - Cardápio Digital</title>
        <meta name="description" content="Cardápio digital inteligente com IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4AF37" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: 100%; font-family: Arial, sans-serif; background: #000; color: #fff; }
            .install-prompt {
              position: fixed;
              bottom: 20px;
              left: 20px;
              right: 20px;
              background: #D4AF37;
              color: #000;
              padding: 15px;
              border-radius: 10px;
              display: none;
              align-items: center;
              justify-content: space-between;
              z-index: 1000;
            }
            .install-prompt.show { display: flex; }
            .install-btn {
              background: #000;
              color: #D4AF37;
              border: none;
              padding: 8px 16px;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
            }
          `
        }} />
      </head>
      <body>
        {children}
        <div id="install-prompt" className="install-prompt">
          <span>📱 Instalar Muzzajazz como app?</span>
          <div>
            <button id="install-btn" className="install-btn">Instalar</button>
            <button id="dismiss-btn" className="install-btn" style={{marginLeft: '10px'}}>Depois</button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              document.getElementById('install-prompt').classList.add('show');
            });
            
            document.getElementById('install-btn').addEventListener('click', () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                  deferredPrompt = null;
                  document.getElementById('install-prompt').classList.remove('show');
                });
              }
            });
            
            document.getElementById('dismiss-btn').addEventListener('click', () => {
              document.getElementById('install-prompt').classList.remove('show');
            });
          `
        }} />
      </body>
    </html>
  )
}