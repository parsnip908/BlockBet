
import './App.css';
import Test from './test'
import './../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap'
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container className="App-bg-color">
      <h1 className="title">BLOCK BET</h1>
      <Test />
    </Container>
  );
}

export default App;
