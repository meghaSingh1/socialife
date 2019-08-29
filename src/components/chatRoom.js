import React, {Component} from 'react';
import axios from 'axios'
import Navbar from './navbar'


export default class ChatRoom extends Component {
    static chatSocket = null;
    constructor(props) {
      super(props);
      this.state = {
        user: {first_name: '', last_name: '', email: ''},
        user_posts: null,
        allowToPost: false,
        requestUserIsAnonymous: true,
        messages: null,
        connectionEstablished: false,
        userData: null,
        lastMessages: null
      }
    }

    fetchData = async () => {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        await axios.post('/api/check_logged_in', {email: email, chat_room: true}, {headers: 
        {'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': "Bearer " + token}})
         .then(async (res) => {
            console.log(res);
            if (res.status !== 200) {
                console.log(res);
                localStorage.clear()
                this.props.history.push('/login'); }
            else await this.setState({user: res.data.user, userData: res,})
            this.getLastMessages(res.data.messages);
        }).catch(err => {localStorage.clear(); this.props.history.push('/login');})
    }

    getLastMessages = (msg) => {
        //Find all rooms with newest messages
        let availRoomUUID = [];
        let messages = [];
        for(let i = 0; i < msg.length; i++) {
            if(!availRoomUUID.includes(msg[i].chat_room.uuid)) {
                messages.push(msg[i]);
                availRoomUUID.push(msg[i].chat_room.uuid)
            }
        }
        for (let i = 0; i < messages.length; i++) {
            for(let j = 0; j < messages[i].chat_room.users.length; j++) {
                if(messages[i].chat_room.users[j].profile_name != localStorage.getItem('profile_name')) {
                    messages[i].otherEndUser = messages[i].chat_room.users[j];
                    break; }
            }
        }
        this.setState({lastMessages: messages});
    }

    connectToSocket = async () => {
        let uuid = this.props.match.params.uuid;

        // this.chatSocket = new WebSocket("wss://socialifenetwork.herokuapp.com/ws/chat/" + uuid + '/');
        this.chatSocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/" + uuid + '/');
        this.chatSocket.onopen = (e) => {
            // chatSocket.send(JSON.stringify(msg));
            this.setState({connectionEstablished: true})
            var msg = {
                type: "fetch_messages",
                message: '',
                email: localStorage.getItem('email'),
                token: localStorage.getItem('token'),
            };
            this.chatSocket.send(JSON.stringify(msg));
        };

        this.chatSocket.onmessage = async (e) => {
            console.log(e);
            let msg = JSON.parse(e.data);
            if (msg.message != undefined)
            {
                console.log(msg.uuid);
                console.log(this.props.match.params.uuid);
                if (msg.type == 'chat_message' && msg.uuid === this.props.match.params.uuid) {
                    let newMessages = this.state.messages == null ? [] : this.state.messages.slice();
                    this.getLastMessages(msg.last_messages);
                    newMessages.push(msg.message);
                    this.setState({
                        messages: newMessages
                    });
                }
                    
                else if (msg.type == 'fetch_messages')
                    this.setState({
                        messages: msg.message
                    })
                var objDiv = document.getElementById("chat-message-section");
                if(objDiv !== null)
                    objDiv.scrollTop = objDiv.scrollHeight;
            }
            else {
                this.props.history.goBack();
            }
        }
    }

    componentDidMount() {
        if(this.props.match.params.uuid != null) {
        this.fetchData();
        this.connectToSocket(); }
        else
            this.setState({messages: [], lastMessages: [], connectionEstablished: true})
    }

    async componentDidUpdate(prevProps) {
        if(prevProps.match.params.uuid !== this.props.match.params.uuid)
        {
            await this.setState({connectionEstablished: false, messages: null});
            this.fetchData();
            this.connectToSocket();
        }
    }

    componentWillUnmount() {
        this.chatSocket.close();
    }


    sendChatMessage = (e) => {
        e.preventDefault();
        this.setState({message: ''})
        var msg = {
            type: "chat_message",
            message: this.state.message,
            email: localStorage.getItem('email'),
            token: localStorage.getItem('token'),
        };

        this.chatSocket.send(JSON.stringify(msg));
    }

    goToRoom = (uuid) => {
        // window.location.href = '/chat/' + uuid;
        this.props.history.push('/chat/' + uuid);
    }

    render() {
        const messageList = this.state.messages == null ? '' : this.state.messages.map((msg) => {
            if(msg.user.email == this.state.user.email)
                return (<div role="listitem" className="item chat-message-right">
                <div className="content">
                <a href={'/profile/' + msg.user.profile_name} className="header">{msg.user.first_name + ' ' + msg.user.last_name}</a>
                <div className="description">
                    {msg.content}
                </div>
                </div>
                <img src={"http://127.0.0.1:8000" + msg.user.avatar} className="ui avatar image"/>
            </div>)
            else
            return (<div role="listitem" className="item chat-message-left">
                <img src={"http://127.0.0.1:8000" + msg.user.avatar} className="ui avatar image"/>
                <div className="content">
                <a href={'/profile/' + msg.user.profile_name} className="header">{msg.user.first_name + ' ' + msg.user.last_name}</a>
                <div className="description">
                    {msg.content}
                </div>
                </div>
            </div>)
        });
        
        const lastMessages = this.state.lastMessages == null ? <div style={{marginTop: '.5em'}} className="ui active centered inline loader"></div> :
        this.state.lastMessages.length == 0 ? <div style={{marginTop: '.5em'}}></div> :
        this.state.lastMessages.map(room => (
            <div onClick={() => this.goToRoom(room.chat_room.uuid)} className="item chat-room-list-item">
            <div className="ui tiny image">
                <img src={'http://127.0.0.1:8000' + room.otherEndUser.avatar} />
            </div>
            <div className="content">
                <a className="header">{room.otherEndUser.first_name + ' ' + room.otherEndUser.last_name}</a>
                <div className="description">
                <p>{room.content}</p>
                </div>
            </div>
            </div>
        ))

        const body = !this.state.connectionEstablished ? <div style={{marginTop: '.5em'}}  className="ui active centered inline loader"></div> : (
            <div className='chat-container row ui grid'>
                <div className='four wide column chat-column-1'>
                <div className='chat-column-2-header row'><h3>Your Conversations</h3></div>
                <div className="ui items chat-room-list">
                    {lastMessages}
                </div>
                </div>
                <div className='one wide column'></div>

                {this.state.messages == null ? <div className='eleven wide column chat-column-2 grid'><div className="ui active centered inline loader"></div></div> :
                this.state.messages.length && this.props.match.params.uuid == 0 ? 
                <div className='eleven wide column chat-column-2 grid'>
                    <div className="ui warning message">
                        <div className="header">You don't have any conversations!</div>
                        <p>Start making some friends!</p>
                    </div>
                </div> :
                <div className='eleven wide column chat-column-2'>
                    <div className='chat-column-2-header row'><h3>Messages</h3></div>
                    <div role="list" id='chat-message-section' className="ui very relaxed list chat-message-section row">
                        
                        {messageList}
                    </div>
                    <div className='send-message-form-wrapper row'><form className='ui form grid send-message-form' onSubmit={this.sendChatMessage}>
                            <div className="field fourteen wide column">
                                <input className='ui input' value={this.state.message} onChange={e => this.setState({message: e.target.value})}/>
                            </div>
                            <div className="field two wide column"><button className="ui icon button"><i aria-hidden="true" className="send icon"></i></button></div>
                    </form></div>
                </div>}
            </div>
        );

        return (
            <div className='chat-wrapper'>
                <Navbar getLastMessages={this.getLastMessages} userData={this.state.userData} history={this.props.history}/>
                {body}
            </div>
        )
    }
  }