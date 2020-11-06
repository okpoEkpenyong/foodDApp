import React, { Component } from "react";
import { Nav, Navbar } from "react-bootstrap";
import Web3 from 'web3'
import './App.css';
import FoodXchange from './contracts/FoodXchange.json'
import logo from "./img/wlogo.svg";
import "./styles.css"
import Main from './Main'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      foodCount: 0,
      products: [],
      loading: false,
      isAuthenticated: false,
    }
  
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }
   
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = FoodXchange.networks[networkId]
    if(networkData) {
      const foodXchange = new web3.eth.Contract(FoodXchange.abi, networkData.address)
      this.setState({ FoodXchange: foodXchange })
      const productCount = await foodXchange.methods.productCount().call()
      this.setState({ productCount })
      // Load products
      for (var i = 1; i <= productCount; i++) {
        const product = await foodXchange.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false})
    } else {
      window.alert('FoodXchange contract not deployed to detected network.')
    }
  }


  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.FoodXchange.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseProduct(id, price) {
   // this.setState({ loading: true })
    this.state.FoodXchange.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }


  handleLogout () {
    this.state.isAuthenticated(false)
 }  

render() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="xl" className="navb">
        <Navbar.Brand href="/">
          <img alt="logo" src={logo} width="30" height="30" className="d-inline-block align-top nav-logo" />{' '}ETONO VILLAGE FOOD EXCHANGE
       </Navbar.Brand>
       <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          { this.state.isAuthenticated
          ?  <Nav.Link href="/login" >Logout</Nav.Link>
          : <>
          <Nav>
            <Nav.Link href="/login">Login</Nav.Link> 
            <Nav.Link href="/signup">Signup</Nav.Link> 
          </Nav>

          </>
        }
        </Navbar.Collapse>
      </Navbar>
    <div className="App">
    <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} />
              }
            </main>
          </div>
        </div>
    </div>
      
    </>

  );
 }
}

export default App;