import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './components/AppRouter.jsx'
import { parseDna } from './services/parse_dna'
ReactDOM.render((
  <AppRouter />
), document.getElementById('app'));

window.parseDna = parseDna;