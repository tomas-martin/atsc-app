/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atsc: {
          'azul-oscuro': '#0B1F4F',
          'azul-medio':  '#1A3A7A',
          'azul-claro':  '#2755B0',
          'azul-bright': '#3B6FD4',
          'rojo':        '#C8102E',
          'rojo-oscuro': '#9B0B21',
          'rojo-bright': '#E8192F',
          'fondo':       '#F0F3FA',
          'gris-claro':  '#E8ECF4',
          'gris-medio':  '#B0B9CC',
          'gris-texto':  '#6B7590',
        }
      },
      fontFamily: {
        'barlow':     ['Barlow', 'sans-serif'],
        'condensed':  ['Barlow Condensed', 'sans-serif'],
      }
    }
  },
  plugins: []
}
