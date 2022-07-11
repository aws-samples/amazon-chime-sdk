(async function () {
  /**
   * You can also manually add scripts in your application.
   * 1. <link href="__AMAZON_CHIME_SDK_WIDGET_DEMO_CSS__" rel="stylesheet" />
   * 2. <script src="__AMAZON_CHIME_SDK_WIDGET_DEMO_JS__"></script>
   * 3. window.initAmazonChimeSDKWidget();
   */
  const files = ['__AMAZON_CHIME_SDK_WIDGET_DEMO_CSS__', '__AMAZON_CHIME_SDK_WIDGET_DEMO_JS__'];
  await Promise.all(
    files.map((file) => {
      return new Promise((resolve) => {
        if (file.endsWith('.js')) {
          const script = document.createElement('script');
          script.type = 'application/javascript';
          script.src = file;
          script.onload = () => {
            resolve();
          };
          document.body.appendChild(script);
        } else if (file.endsWith('.css')) {
          const script = document.createElement('link');
          script.href = file;
          script.type = 'text/css';
          script.rel = 'stylesheet';
          script.onload = () => {
            resolve();
          };
          document.getElementsByTagName('head')[0].appendChild(script);
        }
      });
    })
  );
  window.initAmazonChimeSDKWidget();
})();
