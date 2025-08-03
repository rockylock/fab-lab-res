# CoA Fab Lab - Reservation System

A modern web application for managing machine reservations and workshop bookings at the CoA Fab Lab.

## Project Structure

```
├── index.html                 # Main HTML file
├── css/                      # Stylesheets organized by category
│   ├── base/                 # Base styles (variables, reset, typography)
│   ├── layout/               # Layout components (container, header, navigation)
│   ├── components/           # UI components (buttons, forms, cards, etc.)
│   ├── pages/                # Page-specific styles
│   └── utilities/            # Utility classes
├── js/                       # JavaScript modules
│   ├── utils/                # Utility functions (validation, time)
│   ├── services/             # Data services (reservations, machines)
│   ├── components/           # UI components (UIManager)
│   └── main.js               # Application entry point
├── assets/                   # Static assets (images, icons)
└── README.md                 # This file
```

## Features

- **Equipment Reservation**: Browse and reserve lab equipment
- **Calendar View**: View all reservations and lab schedule **Planned**
- **Admin Dashboard**: Manage reservations and view statistics
- **Machine Management**: Add, edit, and manage workshop equipment
- **Responsive Design**: Works on desktop and mobile devices
- **Component-Based Architecture**: Modular CSS and JavaScript

## Development

### Running Locally

1. Clone this repository
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open http://localhost:8000 in your browser

### File Organization

The project uses a component-based architecture:

- **CSS**: Each component has its own stylesheet following BEM methodology
- **JavaScript**: Modular ES5 JavaScript with clear separation of concerns
- **HTML**: Semantic markup with proper accessibility attributes

### CSS Architecture

- `css/base/variables.css` - CSS custom properties for consistent theming
- `css/base/reset.css` - Modern CSS reset
- `css/base/typography.css` - Typography styles
- `css/layout/` - Layout components
- `css/components/` - Reusable UI components
- `css/pages/` - Page-specific styles
- `css/utilities/` - Utility classes

### JavaScript Architecture

- `js/utils/` - Pure utility functions
- `js/services/` - Data management and business logic
- `js/components/` - UI component management
- `js/main.js` - Application initialization

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Graceful degradation for older browsers

## Contributing

1. Follow the existing code structure
2. Use semantic HTML and accessible markup
3. Follow BEM CSS methodology
4. Write modular, documented JavaScript
5. Test on multiple browsers and devices

## License

This project is for educational use at the College of Alameda Fab Lab.