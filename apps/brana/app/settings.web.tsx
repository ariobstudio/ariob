import '../global.web.css';

export default function SettingsWebPage() {
  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      <main className="settings-content">
        <div className="settings-message">
          <i className="fa-solid fa-gear" style={{ fontSize: 28 }} />
          <h2>Settings</h2>
          <p>
            This section is being worked on.<br />
            More options coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
