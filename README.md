# Table & Thyme — restaurant ordering demo

A mobile-first restaurant ordering and management demo built with HTML, CSS and vanilla JavaScript. Data is saved in browser LocalStorage; there is no backend or payment verification.

## Run in Visual Studio Code

1. Open this folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and choose **Open with Live Server** for the customer ordering page.
4. Open `admin.html` in the same Live Server origin to manage the demo restaurant. Use the **Admin** link on the customer page to open it.

The admin sign-in is `amadmin` / `amadmin27`. This is a front-end demo gate only: credentials are included in the JavaScript, so do not use it to protect real restaurant or customer data. Production authentication requires a server-side login and authorization.

The app loads QR-generation and QR-scanning libraries from public CDNs. QR camera scanning requires a secure context (`localhost` through Live Server is supported) and browser camera permission. You can scan a generated table QR with a phone camera to open the matching table menu.

## Demo features

- Customer menu with categories, search, item options, extras, spice level and notes.
- Cart quantity and customization editing, GST, and the `THYME10` demo discount.
- Checkout with table selection; once served, guests can pay by UPI QR, card or cash.
- Prices and bills are displayed in Indian rupees (INR). The UPI QR uses the `UPI_ID` value in `js/app.js`; verify it before use. The app cannot verify transfers, and card/cash payments must be confirmed only after staff receives them.
- Appearance settings let guests and staff choose light or dark mode, a preset accent color, or a custom color. Preferences are saved in the browser and shared across the customer and admin pages on the same origin.
- Order tracking with simulated status progression; admin can update statuses immediately.
- Admin overview, table CRUD and QR print view, menu CRUD, order handling, billing and table release.
- Sample menu, restaurant tables and all order/table data persist in LocalStorage and update across open customer/admin tabs in the same browser.

To reset the demo data, clear this site's LocalStorage key `tableThymeDemo_v1` in browser developer tools and reload.
