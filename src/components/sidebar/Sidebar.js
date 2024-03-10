import './Sidebar.css'
import { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import SidebarOption from '../sidebarOption/SidebarOption'
import CreateIcon from '@material-ui/icons/Create'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import InsertCommentIcon from '@material-ui/icons/InsertComment'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import AddIcon from '@material-ui/icons/Add'
import { CometChat } from '@cometchat-pro/chat'
import { Link, useHistory } from 'react-router-dom'
import React from 'react';

function Sidebar() {
  const [channels, setChannels] = useState([])
  const [user, setUser] = useState(null)
  const [dms, setDms] = useState([])
  const [selectedDM, setSelectedDM] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const history = useHistory()

  const getDirectMessages = () => {
    const limit = 10
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .friendsOnly(true)
      .build()

    usersRequest
      .fetchNext()
      .then((userList) => setDms(userList))
      .catch((error) => {
        console.log('User list fetching failed with error:', error)
      })
  }

  const getChannels = () => {
    const limit = 30
    const groupsRequest = new CometChat.GroupsRequestBuilder()
      .setLimit(limit)
      .joinedOnly(true)
      .build()

    groupsRequest
      .fetchNext()
      .then((groupList) => setChannels(groupList))
      .catch((error) => {
        console.log('Groups list fetching failed with error', error)
      })
  }

  const logOut = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem('user')
        history.push('/login')
      })
      .catch((error) => console.log(error.message))
  }

  const handleDMSelection = (dm) => {
    setSelectedDM(dm)
    // Fetch messages between current user and selected DM
    CometChat.getConversation(
      dm.uid,
      CometChat.RECEIVER_TYPE.USER
    ).then((conversation) => {
      setMessages(conversation.messages)
    })
  }

  const sendMessage = () => {
    const textMessage = new CometChat.TextMessage(
      selectedDM.uid,
      messageInput,
      CometChat.RECEIVER_TYPE.USER
    )

    CometChat.sendMessage(textMessage).then(
      (message) => {
        setMessages((prevMessages) => [...prevMessages, message])
        setMessageInput('')
      },
      (error) => {
        console.log('Message sending failed with error:', error)
      }
    )
  }

  useEffect(() => {
    const data = localStorage.getItem('user')
    setUser(JSON.parse(data))

    getChannels()
    getDirectMessages()
  }, [])

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__info">
          <h2>
            <Link to="/">My Account</Link>
          </h2>
          <h3>
            <FiberManualRecordIcon />
            {user?.displayName}
          </h3>
        </div>
        <CreateIcon />
      </div>
      <div className="sidebar__options">
        <SidebarOption Icon={InsertCommentIcon} title="Thread" />
        <SidebarOption Icon={AlternateEmailIcon} title="Mentions & Reactions" />
        <SidebarOption Icon={MoreVertIcon} title="More" />
        <hr />
        <SidebarOption Icon={ArrowDropDownIcon} title="Channels" />
        <hr />
        {channels.map((channel) =>
          channel.type === 'private' ? (
            <SidebarOption
              Icon={LockOutlinedIcon}
              title={channel.name}
              id={channel.guid}
              key={channel.guid}
              sub="sidebarOption__sub"
            />
          ) : (
            <SidebarOption
              title={channel.name}
              id={channel.guid}
              key={channel.guid}
              sub="sidebarOption__sub"
            />
          )
        )}

        <SidebarOption
          Icon={AddIcon}
          title="Add Channel"
          sub="sidebarOption__sub"
          addChannelOption
        />
        <hr />
        <SidebarOption Icon={ArrowDropDownIcon} title="Direct Messages" />
        <hr />
        {dms.map((dm) => (
          <SidebarOption
            Icon={FiberManualRecordIcon}
            title={dm.name}
            id={dm.uid}
            key={dm.uid}
            sub="sidebarOption__sub sidebarOption__color"
            user
            online={dm.status === 'online' ? 'isOnline' : ''}
            onClick={() => handleDMSelection(dm)}
          />
        ))}
      </div>
      {selectedDM && (
        <div className="sidebar__messages">
          <h4>Chatting with {selectedDM.name}</h4>
          <div className="sidebar__messagesContainer">
            {messages.map((message) => (
              <p key={message.id}>{message.text}</p>
            ))}
          </div>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
      <button className="sidebar__logout" onClick={logOut}>
        Logout
      </button>
    </div>
  )
}

export default Sidebar
