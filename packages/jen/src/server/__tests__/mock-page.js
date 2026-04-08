import { h, Component } from 'preact';

class MockPage extends Component {
  render() {
    return h('div', { id: 'mock-page' }, 'Hello Stream!');
  }
}

export default MockPage;
