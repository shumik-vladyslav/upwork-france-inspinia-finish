import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { smoothlyMenu } from '../../../app.helpers';
import { AuthGuard } from '../../auth.service';
import { ChatMessage } from '../../../models/ChatMessage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
declare var jQuery: any;

@Component({
  selector: 'topnavbar',
  templateUrl: 'topnavbar.template.html'
})
export class TopNavbarComponent {
  hideAdminChat = true;
  hideSmallChat = true;

  users = this.db.list('/users');

  adminUsersGr = [];
  managersGr = [];
  sellersGr = [];
  unregisterGr = [];
  newMessagesArray = [];
  totalNewMessCntr = null;

  currentChat;
  currChatUser;
  currChatUserKey;

  chatmessage;
  selfName;
  userRole;
  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private router: Router,
    private authServ: AuthGuard
    ) {
    this.selfName = this.authServ.userInfo.name;
    this.users.subscribe (
      users => {
        this.totalNewMessCntr = 0;
        for (let i = 0; i < users.length; i++) {
          const u = users[i];
          db.object(`/chats/${u.$key}/newMessCounter`).subscribe(
            obj => {
              // && this.currChatUser != u.name
              if (obj) {
                // this.newMessagesArray.push(obj.$value);
                u.newMessages = obj.$value;
                // this.totalNewMessCntr = this.totalNewMessCntr + obj.$value;
              } else {
                // this.newMessagesArray.push(null);
                u.newMessages = null;
              }

              this.totalNewMessCntr = users.reduce((p, c) => p + c.newMessages, 0 );
              if (this.totalNewMessCntr == 0){
                this.totalNewMessCntr = null;
              }
            }
          );

          switch (u.role) {
            case 'admin-user':
              this.adminUsersGr.push(u);
              break;
            case 'manager':
              this.managersGr.push(u);
              break;
            case 'seller':
              this.sellersGr.push(u);
              break;
            case 'unregister':
              this.unregisterGr.push(u);
              break;
            default:
              break;
          }
        }
      }
    );
  }
  // Chat functions
  onSendChatMessage(text) {
    console.log(`send message ${text}`);
    const mess = new ChatMessage(this.authServ.userInfo.name, text);
    this.currentChat.push(mess);
  }


  onChangeChatUser(uid, event) {
    console.log('change chat user ' + uid);
    this.currentChat = this.db.list(`/chats/${uid}`);
    this.currChatUserKey = uid;

    // new messages counter
    this.db.list(`/chats`).update(uid, { newMessCounter: null});
    // console.log(event.screenY);
    // console.log(event.clientY);
    jQuery('#sm-adm-cht').css({ top: event.clientY });
    setTimeout(() => {
      jQuery('#sm-adm-cht').css({ top: event.clientY });
          this.hideSmallChat = false;
        }, 300);
  }

  onSendChatMess(text) {
    const mess = new ChatMessage(this.authServ.userInfo.name, text);
    this.db.list(`/chats`).update(this.currChatUserKey, { newMessCounter: null});
    // console.log('send chat message ' + text);
    // this.chatMessages.push(mess);
    // var $chat = $('.small-chat-box .content');
    // $chat.scrollTop($chat.height());

    // push to firebase
    this.currentChat.push(mess);

    this.db.object(`/chats/${this.currChatUserKey}/unrUsrMsgs`).take(1).subscribe (
      counter => {
        console.log(counter);
        if (!counter.$value) {
          counter.$value = 0;
        }
        this.db.list(`/chats`).update(this.currChatUserKey, { unrUsrMsgs: counter.$value + 1});
      }
    );
  }
  // End chat functions

  toggleNavigation(): void {
    jQuery('body').toggleClass('mini-navbar');
    smoothlyMenu();
  }

  logout() {
    this.router.navigate([ '/login' ]);
    this.authServ.signOut();
    this.afAuth.auth.signOut();
  }

  login() {
    this.router.navigate([ '/login' ]);
  }

}
