(async () => {
  const status = document.getElementById("status");
  try {
    const response = await fetch("/admin/config.yml");
    if (!response.ok) throw new Error("Configuration unavailable");
    const config = await response.text();
    if (config.includes("SET_AFTER_TURBO_SETUP")) {
      status.innerHTML =
        '<h1>Your editor is almost ready</h1><p>The site content is stored in GitHub. To enable secure editing, connect this repository in <a href="https://turbo.decapcms.org">Decap Turbo</a> and add its Site ID to <code>public/admin/config.yml</code>.</p><p>This is a one-time setup. Afterward, you can edit pages, journal posts, images, and site settings here.</p><p><a href="/">Return to the website</a></p>';
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/decap-cms@3.17.3/dist/decap-cms.js";
    script.onload = () => {
      status.remove();
      window.CMS.init();
    };
    script.onerror = () => {
      status.textContent =
        "The editor could not load. Check your connection and reload.";
    };
    document.head.append(script);
  } catch {
    status.textContent =
      "The editor configuration could not load. Please reload or contact the site administrator.";
  }
})();
