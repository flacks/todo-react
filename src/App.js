import React from 'react';
import './App.css';
import Jumbotron from "react-bootstrap/Jumbotron";
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';

class TodoApp extends React.Component {
    constructor(props) {
        super(props);
        this.api_url = process.env.REACT_APP_API_URL
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            content: '',
            editItem: {
                id: '',
                content: ''
            },
            showEditModal: false
        };
    }

    updateItems() {
        fetch(this.api_url)
            .then(response => response.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.sort((a, b) => (a.id < b.id) ? 1 : -1)
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {
        this.updateItems();
    }

    handleNewItemContent = (event) => {
        this.setState({content: event.target.value})
    }

    handleEditItemContent = (event) => {
        this.setState({
            editItem: {
                ...this.state.editItem,
                content: event.target.value
            }
        })
    }

    handleAddItem = (event) => {
        let data = {};
        data.content = this.state.content;
        let json = JSON.stringify(data);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", this.api_url)
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                this.updateItems();
                this.setState({content: ''});
            }
        }
        xhr.send(json);

        event.preventDefault();
    }

    handleDeleteItem = (id) => {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", this.api_url + '/' + id)
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 204) this.updateItems();
        }
        xhr.send();
    }

    handleUpdateItem = () => {
        let json = JSON.stringify(this.state.editItem);

        let xhr = new XMLHttpRequest();
        xhr.open("PUT", this.api_url)
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                this.updateItems();
                this.handleCloseEditModal();
            }
        }
        xhr.send(json);

        this.handleCloseEditModal();
    }

    handleEditModal = (item) => {
        this.setState({editItem: item});
        this.setState({showEditModal: true})
    }

    handleCloseEditModal = () => {
        this.setState({showEditModal: false})
    }

    render() {
        const { error, isLoaded, items } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">
                                Add Item
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            placeholder="Describe your TODO"
                            aria-label="Item content"
                            aria-describedby="basic-addon1"
                            value={this.state.content}
                            onChange={this.handleNewItemContent}
                        />
                        <InputGroup.Append>
                            <Button
                                variant="dark"
                                onClick={this.handleAddItem}
                            >
                                Submit
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <Table striped bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Content</th>
                            <th>Time Created</th>
                            <th />
                        </tr>
                        </thead>
                        <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.content}</td>
                                <td>{(new Date(item.timeCreated)).toLocaleString()}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        className="mr-1"
                                        onClick={() => this.handleEditModal(item)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => this.handleDeleteItem(item.id)}
                                    >
                                        Done
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <Modal
                        show={this.state.showEditModal}
                        onHide={this.handleCloseEditModal}
                        animation={true}
                    >
                        <Modal.Header>
                            <Modal.Title>
                                Edit Item
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FormControl
                                aria-label="Item content"
                                aria-describedby="basic-addon1"
                                value={this.state.editItem.content}
                                onChange={this.handleEditItemContent}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary"
                                onClick={this.handleCloseEditModal}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={this.handleUpdateItem}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            );
        }
    }
}

function App() {
    return (
        <Jumbotron>
            <div className="App">
                <TodoApp />
            </div>
        </Jumbotron>
    );
}

export default App;
