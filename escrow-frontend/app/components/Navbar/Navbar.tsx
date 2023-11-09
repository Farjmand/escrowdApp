import React, {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import {MdNotifications} from 'react-icons/md';
import {BsSearch} from "react-icons/bs" ;
import {CgMenuLeft, CgMenuRight} from 'react-icons/cg'
import Styles from './Navbar.module.css'
import { Discover, Profile, Sidebar , Notification, HelpCenter} from "./index"

export const Navbar = () => {
    const [discover, setDiscover] = useState(false);
    const [help, setHelp] = useState(false);
    const [notification, setNotification] = useState(false);
    const [profile, setProfile] = useState(false);
    const [openSideMenu, setOpenSideMenu] = useState(false); 
    return (
  <div className={Styles.navbar}>

<div className={Styles. navbar_container}>

<div className={Styles.navbar_container_left}>

<div className={Styles. logo}>
<Image src={images.logo} alt = "NFT MARKET PLACE"/>
</div>
</div>
<div className={Styles.navbar_container_right}></div>
</div>
</div>
   
    );
}
