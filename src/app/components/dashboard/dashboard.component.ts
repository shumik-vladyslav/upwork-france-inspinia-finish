import {Component, OnDestroy, OnInit,} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {FlotChartDirective} from '../../components/charts/flotChart';
import {Cookie} from 'ng2-cookies';
import {footable} from '../../app.helpers';
import {slimscroll} from '../../app.helpers';
import {List} from 'linqts';
import {Order} from '../orders/orders.component';
import {AuthGuard} from '../auth.service';
import {ChatMessage} from '../../models/ChatMessage';

declare var jQuery: any;
declare var $: any;
declare var FooTable: any;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.template.html'
})

export class DashboardComponent implements OnDestroy, OnInit {
  selfName = '';
  openChat = false;
  // inpu
  searchOrder;
  public nav: any;
  income;
  orders;
  visits;
  ordersTable;

  // for ui orders table
  ordersTable2;
  infos = [];

  orderPercent;
  lastOrderPercent;
  totalOrderPercent;
  incomePercent;

  sumCurrentMonth;
  sumLastMonth;

  dailySales;
  dailySalesPercent;

  private data2 = this.infos;

  // data for chart
  flotDataset: any;

  newClients;
  newClientsPercent;

  stockAlertProducts;

  barWidth;
  flotOptionsTemplate = {
    xaxis: {
      mode: 'time',
      tickSize: [30, 'day'],
      // tickLength: 0,
      axisLabel: 'Date',
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Arial',
      axisLabelPadding: 10,
      color: '#d5d5d5'
    },
    yaxes: [{
      position: 'left',
      // max: 5,
      color: '#d5d5d5',
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Arial',
      axisLabelPadding: 3
    }, {
      // max: 30,
      position: 'right',
      clolor: '#d5d5d5',
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: ' Arial',
      axisLabelPadding: 3
    }
    ],
    legend: {
      noColumns: 1,
      labelBoxBorderColor: '#000000',
      position: 'nw'
    },
    grid: {
      hoverable: true,
      borderWidth: 0
    }
  };
  public flotOptions: any = this.flotOptionsTemplate;

  // Chat functionality
  chatMessages = this.db.list(`/chats/${this.authServ.userId}`);
  messages = [];
  newMessagesNum = null;

  projects: FirebaseListObservable<any[]>;

  ordersListForTable;
  rowsPerPage = 20;

  onRowsPerPageChange() {
    FooTable.get('.footable').pageSize(this.rowsPerPage);
  }

  public constructor(public db: AngularFireDatabase,
                     private authServ: AuthGuard) {
    this.db.list(`/shops/${this.authServ.userId}/orders`).subscribe(
      orders => {
        this.ordersListForTable = orders;
        setTimeout(() => {
          FooTable.init('.footable');
        }, 300);
      }
    );

    if (true) {
      this.db.object(`/chats/${this.authServ.userId}/unrUsrMsgs`).subscribe(
        obj => {
          if (obj) {
            this.newMessagesNum = obj.$value;
            console.log('obj.$value;' + obj.$value);
          } else {
            this.newMessagesNum = null;
          }
        }
      );
    }
    this.chatMessages.subscribe(
      mess => {
        // if (!this.openChat) {
        //   this.newMessagesNum = mess.length - this.messages.length + this.newMessagesNum;
        // } else {
        //   this.newMessagesNum = null;
        // }
        this.messages = mess;
      }
    );

    this.nav = document.querySelector('nav.navbar');

    db.list(`/shops/${this.authServ.userId}/products`).subscribe(
      products => {
        console.log('products fetched');
        this.stockAlertProducts = products.filter(p => !p.isService && (p.quantity < p.stockAlert));
      }
    );

    // todo visits save to user
    // this.visits = client.visits;

    this.ordersTable2 = db.list(`/shops/${this.authServ.userId}/orders`);

    // income chart
    // this.daySort();
    this.monthSort();
    // this.yearsSort();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth()).getMonth();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1).getMonth();

    this.ordersTable = db.list(`/shops/${this.authServ.userId}/orders`).subscribe(snapshots => {

      const lastDay = now.getDate();
      const prevDay = new Date(now.getFullYear(), now.getMonth(), lastDay - 1).getDate();

      this.dailySales = snapshots.filter(o => new Date(o.date).getDate() == lastDay && o.paid == 'paid').length;
      const prevDaySales = snapshots.filter(o => new Date(o.date).getDate() == prevDay && o.paid == 'paid').length;
      this.dailySalesPercent = Math.floor(this.dailySales / prevDaySales * 100);

      this.income = 0;
      this.orders = 0;
      this.orderPercent = 0;
      this.lastOrderPercent = 0;
      this.totalOrderPercent = 0;

      this.sumCurrentMonth = 0;
      this.sumLastMonth = 0;

      let lastMonthIncome = 0;
      let lastMonthOrders = 0;

      let prevMonthIncome = 0;
      let prevMonthOrders = 0;

      for (var index = 0; index < snapshots.length; index++) {
        var snapshot = snapshots[index];
        let orderDate = new Date(snapshot.date);
        if (orderDate.getMonth() == lastMonth) {
          lastMonthIncome += snapshot.orderSum;
          lastMonthOrders += 1;
        } else if (orderDate.getMonth() == prevMonth) {
          prevMonthIncome = snapshot.orderSum;
          prevMonthOrders += 1;
        }
      }
      this.orders = lastMonthOrders;
      this.totalOrderPercent = Math.floor((lastMonthOrders - prevMonthOrders) / prevMonthOrders * 100);

      this.income = lastMonthIncome;
      this.incomePercent = Math.floor((lastMonthIncome - prevMonthIncome) / prevMonthIncome * 100);
    });

    this.db.list(`/shops/${this.authServ.userId}/clients`).subscribe(
      clients => {
        this.newClients = clients.filter(c => c.date > lastMonth).length;
        const newClientsPrevMonth = clients.filter(c => (new Date(c.date)).getMonth() == prevMonth).length;
        this.newClientsPercent = Math.floor(this.newClients / newClientsPrevMonth * 100);
      },
      error => console.log('fetch clients errr ' + error)
    );
  }

  offersFilter(period: string) {
    // FooTable.get('.footable')
    console.log('offersFilter');
    // $('#yea').removeClass('active');
    // $('#mon').removeClass('active');
    // $('#day').removeClass('active');

    let dataThreshold;
    const date = new Date();
    switch (period) {
      case 'day':
        // $('#day').addClass('active');
        dataThreshold = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        break;
      case 'month':
        // $('#mon').addClass('active');
        dataThreshold = new Date(date.getFullYear(), date.getMonth());
        break;
      case 'year':
        // $('#yea').addClass('active');
        dataThreshold = new Date(date.getFullYear());
        break;
      default:
        break;
    }
    this.db.list(`/shops/${this.authServ.userId}/orders`).subscribe(
      orders => {
        this.ordersListForTable = orders.filter(o => o.date > dataThreshold);
        setTimeout(() => {
          FooTable.init('.footable');
        }, 300);
      }
    );
  }

  updateChartDatasets(orders, income = []) {
    this.flotDataset = [
      {
        label: 'Number of orders',
        data: orders,
        color: '#1ab394',
        bars: {
          fill: true,
          show: true,
          align: 'center',
          barWidth: this.barWidth,
          // lineWidth: 2
        }
      },
      {
        label: 'Income',
        data: income,
        color: '#1c84c6',
        series: {
          lines: {show: true},
          points: {show: true}
        }
        , yaxis: 2
      }
    ];
  }

  onSearchOrderClick() {
  }

  public ngOnInit(): any {
    this.nav.className += ' white-bg';

    //  footable();
    // slimscroll();
    // Initialize slimscroll for small chat
    let chtDomEl = $('.small-chat-box .content').slimScroll({
      height: '234px',
      railOpacity: 0.4
    });
    this.authServ.fetchUserSettings().subscribe(
      sett => this.selfName = sett.name
    );

    $(".btn-group > .btn").click(function () {
      $(this).addClass("active").siblings().removeClass("active");
    });
  }

  public ngOnDestroy(): any {
    this.nav.classList.remove('white-bg');
  }

  getDateOfTimeStamp(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  getHoursOfTimeStamp(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
  }

  getMonthOfTimeStamp(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth()).getTime();
  }

  prepareDatasetForChartIncome(orders: List<Order>, roundDataFunction) {
    let result = orders.GroupBy(order => roundDataFunction(order.date), o => +o.orderSum);
    let data = [];
    for (let key in result) {
      if (result.hasOwnProperty(key)) {
        let element = result[key];
        let temp = element.reduce((acc, item) => acc += item, 0);
        data.push([+key, element.reduce((acc, item) => acc += item, 0)]);
      }
    }
    return data.sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      }
      if (a[0] > b[0]) {
        return 1;
      }
      return 0;
    });
  }

  prepareDatasetForChartOrders(orders: List<Order>, roundDataFunction) {
    let result = orders.GroupBy(order => roundDataFunction(order.date), o => 1);

    let data = [];
    for (let key in result) {
      if (result.hasOwnProperty(key)) {
        let element = result[key];
        let temp = element.reduce((acc, item) => acc += item, 0);
        data.push([key, element.reduce((acc, item) => acc += item, 0)]);
      }
    }
    return data.sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      }
      if (a[0] > b[0]) {
        return 1;
      }
      return 0;
    });
  }

  yearsSort() {
    this.barWidth = 15 * 24 * 60 * 60 * 1000;
    this.flotOptionsTemplate.xaxis.tickSize = [1, 'month'];
    this.flotOptions = this.flotOptionsTemplate;

    this.ordersTable = this.db.list(`/shops/${this.authServ.userId}/orders`).subscribe(snapshots => {
      let orders = new List<Order>(snapshots);
      let income = this.prepareDatasetForChartIncome(orders, this.getMonthOfTimeStamp);
      let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getMonthOfTimeStamp);

      setTimeout(() => {
        this.updateChartDatasets(letOrdersData, income);

      }, 2000);
    });
  }

  monthSort() {
    this.barWidth = 12 * 60 * 60 * 1000;
    const date = new Date();
    let currentMonth = new Date(date.getFullYear(), date.getMonth());

    this.flotOptionsTemplate.xaxis.tickSize = [1, 'day'];
    this.flotOptions = this.flotOptionsTemplate;

    this.ordersTable = this.db.list(`/shops/${this.authServ.userId}/orders`).subscribe(snapshots => {
      let orders = new List<Order>(snapshots.filter(s => s.date > currentMonth));
      // let orders = new List<Order>(snapshots);
      let income = this.prepareDatasetForChartIncome(orders, this.getDateOfTimeStamp);
      let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getDateOfTimeStamp);

      setTimeout(() => {
        this.updateChartDatasets(letOrdersData, income);
      }, 2000);
    });
  }

  daySort() {
    this.barWidth = 30 * 60 * 1000;
    const date = new Date();
    let currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    this.flotOptionsTemplate.xaxis.tickSize = [3, 'hour'];
    this.flotOptions = this.flotOptionsTemplate;
    this.ordersTable = this.db.list(`/shops/${this.authServ.userId}/orders`).subscribe(snapshots => {
      let orders = new List<Order>(snapshots.filter(s => s.date > currentDay));

      let income = this.prepareDatasetForChartIncome(orders, this.getHoursOfTimeStamp);
      let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getHoursOfTimeStamp);

      setTimeout(() => {
        this.updateChartDatasets(letOrdersData, income);
      }, 2000);
    });
  }

  onChatToggle() {
    console.log('chat toggle');

    this.openChat = !this.openChat;

    // renew unreaded counter
    this.db.list(`/chats`).update(this.authServ.userId, {unrUsrMsgs: null});

    console.log(this.openChat);
  }

  onSendChatMess(text) {
    const mess = new ChatMessage(this.selfName, text);
    // this.newMessagesNum = null;
    this.db.list(`/chats`).update(this.authServ.userId, {unrUsrMsgs: null});
    // push to firebase
    this.chatMessages.push(mess);

    this.db.object(`/chats/${this.authServ.userId}/newMessCounter`).take(1).subscribe(
      counter => {
        console.log(counter);
        if (!counter.$value) {
          counter.$value = 0;
        }
        this.db.list(`/chats`).update(this.authServ.userId, {newMessCounter: counter.$value + 1});
      }
    );
  }

  onMessShow(text) {
    console.log('show mess ' + text);
  }
}
