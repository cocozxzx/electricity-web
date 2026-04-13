module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px', // The unit to convert
      viewportWidth: 1920, // The width of the viewport (design draft width)
      unitPrecision: 5, // The decimal numbers to allow the REM units to grow to
      propList: ['*'], // The properties that can change from px to vw
      viewportUnit: 'vw', // Expected units
      fontViewportUnit: 'vw', // Expected units for font
      selectorBlackList: ['.ignore', '.hairlines'], // The selectors to ignore and leave as px
      minPixelValue: 1, // Set the minimum pixel value to replace
      mediaQuery: false, // Allow px to be converted in media queries
      replace: true, // Replace rules containing vw instead of adding fallbacks
      exclude: [/node_modules/], // Exclude node_modules to prevent breaking Ant Design Vue components
      landscape: false // Adds @media (orientation: landscape) with values converted via landscapeWidth
    }
  }
}
