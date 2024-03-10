import './Header.css';
import { Avatar } from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SearchIcon from '@material-ui/icons/Search';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import React from 'react';
import firebase from 'firebase/app'; // Import Firebase
import 'firebase/database'; // Import Firebase Realtime Database

function Header() {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('user');
    setUser(JSON.parse(data));
  }, []);

  useEffect(() => {
    const dbRef = firebase.database().ref('channels');
    dbRef.once('value').then((snapshot) => {
      const channelsData = [];
      snapshot.forEach((childSnapshot) => {
        channelsData.push(childSnapshot.val());
      });
      console.log('Fetched channels:', channelsData); // Log fetched channels
      setChannels(channelsData);
      setFilteredChannels(channelsData); // Set filtered channels initially to all channels fetched
    });
  }, []);

  const handleSearchInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    // Filter channels based on search query
    const filtered = channels.filter(channel =>
      channel.name.toLowerCase().includes(query)
    );
    setFilteredChannels(filtered);
  };
  
  const moveToAcc = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    history.push(`/users/${user.uid}`);
  };

  return (
    <div className="header">
      <div className="header__left">
        <AccessTimeIcon />
      </div>
      <div className="header__middle">
        <SearchIcon />
        <input
          className="search__input"
          placeholder="Search for channels"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>
      {/* Display filtered channels outside the search input box */}
      <div className="filtered__channels">
        {filteredChannels.map((channel) => (
          <div key={channel.id}>{channel.name}</div>
        ))}
      </div>
      <div className="header__right">
        <HelpOutlineIcon />
        <Avatar
          className="header__avatar"
          src={user?.photoURL}
          alt={user?.displayName}
          onClick={moveToAcc}
        />
      </div>
    </div>
  );
}

export default Header;
