import { Component, OnDestroy, OnInit, } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { FlotChartDirective } from '../../components/charts/flotChart';
import { Cookie } from 'ng2-cookies';
import { footable } from '../../app.helpers';
import { List } from 'linqts';
import { Order } from '../orders/orders.component';
declare var jQuery:any;
declare var $: any;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.template.html'
})

export class DashboardComponent implements OnDestroy, OnInit {
  // inpu
  searchOrder;
  public nav: any;
  income;
  orders;
  visits;
  ordersTable;

  // for ui orders table
  ordersTable2;
  infos= [];

  orderPercent;
  lastOrderPercent;
  totalOrderPercent;
  incomePercent;

  sumCurrentMonth;
  sumLastMonth;

  private data2 = this.infos;

  // data for chart
  flotDataset: any;

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
      hoverable: false,
      borderWidth: 0
    }
  };
  public flotOptions: any = this.flotOptionsTemplate;
  


  projects: FirebaseListObservable<any[]>;

  public constructor(public db: AngularFireDatabase) {
    let timearray = [1483351240000,1486324840000,1488776440000,1491444040000,1496307640000,1496408440000,1496509240000,
    1496797240000,1496804440000,1496811640000];
    let orderSumArray = [600,100,200,800,50,10,700,200,300,25,450,100,];


    // setTimeout(() => {
    //   for (let index = 0; index < timearray.length; index++) {
    //         const date = timearray[index];
    //         const sum = orderSumArray[index];
    //         let order = new Order();
    //         order.orderId = index;
    //         order.date = date;
    //         order.orderSum = sum;
    //         order.clientName = "JonDirr";
    //         order.status = 'pending';
    //         order.paid = 'paid';
    //         order.products = ['Swodoo','Shield'];
    //         order.quantity = 1;
    //         order.priceMethod = '';
    //         order.notes = '';
    //         order.ticketNumber = '';
    //         this.db.list('orders').update(index.toPrecision(), order);
    //       }
    //   }
    // , 3000);

    this.nav = document.querySelector('nav.navbar');

    this.projects = db.list('/projects');

    // todo visits save to user
    // this.visits = client.visits;

    this.ordersTable2 = db.list('/orders');

    // income chart
    this.daySort();
    // this.monthSort();
    // this.yearsSort();

    this.ordersTable = db.list('/orders').subscribe(snapshots => {
      this.income = 0;
      this.orders = 0;
      this.orderPercent = 0;
      this.lastOrderPercent = 0;
      this.totalOrderPercent = 0;

      this.sumCurrentMonth = 0;
      this.sumLastMonth = 0;
      ////
      const now = new Date();
      const lastMonth = new Date (now.getFullYear(), now.getMonth()).getMonth();
      const prevMonth = new Date (now.getFullYear(), now.getMonth() - 1).getMonth();

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
  }

barWidth;
 updateChartDatasets (orders, income = []) {
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
              lines: { show: true },
              points: { show: true }
          }
          , yaxis: 2
        }
      ];
  }

  onSearchOrderClick() {
  }

  public ngOnInit():any {
    this.nav.className += ' white-bg';
    footable();
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

  prepareDatasetForChartIncome(orders: List<Order>, roundDataFunction){
    let result = orders.GroupBy(order => roundDataFunction(order.date),  o => +o.orderSum);
        let data = [];
        for (let key in result) {
          if (result.hasOwnProperty(key)) {
            let element = result[key];
            let temp = element.reduce((acc, item) => acc += item, 0);
            data.push([+key, element.reduce((acc, item) => acc += item, 0)]);
          }
        }
        return data.sort((a, b) => {
          if (a[0] < b[0]) {return -1; }
          if (a[0] > b[0]) {return 1; }
          return 0;
        });
  }

  prepareDatasetForChartOrders(orders: List<Order>, roundDataFunction){
    let result = orders.GroupBy(order => roundDataFunction(order.date),  o => 1);
    console.log(result);
    
        let data = [];
        for (let key in result) {
          if (result.hasOwnProperty(key)) {
            let element = result[key];
            let temp = element.reduce((acc, item) => acc += item, 0);
            data.push([key, element.reduce((acc, item) => acc += item, 0)]);
          }
        }
        return data.sort((a, b) => {
          if (a[0] < b[0]) {return -1; }
          if (a[0] > b[0]) {return 1; }
          return 0;
        });
  }

  yearsSort() {
    this.barWidth= 15 * 24 * 60 * 60 * 1000;
     this.flotOptionsTemplate.xaxis.tickSize = [1, "month"];
    this.flotOptions= this.flotOptionsTemplate;

    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
      let orders = new List<Order>(snapshots);
        let income = this.prepareDatasetForChartIncome(orders, this.getMonthOfTimeStamp);
        let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getMonthOfTimeStamp);

        // this.flotOptions.yaxes[0].max = 70;
        // this.flotOptions.yaxes[1].max = 100;

        setTimeout(() => {
          this.updateChartDatasets(letOrdersData, income);
         
        }, 2000);
    });
  }

  monthSort() {
    this.barWidth= 12 * 60 * 60 * 1000;
    const date = new Date();
    let currentMonth =  new Date(date.getFullYear(), date.getMonth());
    console.log(currentMonth);

    this.flotOptionsTemplate.xaxis.tickSize = [1, 'day'];
    this.flotOptions= this.flotOptionsTemplate;

    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
    let orders = new List<Order>(snapshots.filter(s => s.date > currentMonth));
        // let orders = new List<Order>(snapshots);
        let income = this.prepareDatasetForChartIncome(orders, this.getDateOfTimeStamp);
        let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getDateOfTimeStamp);

        // this.flotOptions.yaxes[0].max = 70;
        // this.flotOptions.yaxes[1].max = 100;

        setTimeout(() => {
          this.updateChartDatasets(letOrdersData, income);
        }, 2000);
      });
  }

  daySort() {
    this.barWidth= 30 * 60 * 1000;
    const date = new Date();
    let currentDay =  new Date(date.getFullYear(), date.getMonth(),date.getDate());
    console.log(currentDay);

    this.flotOptionsTemplate.xaxis.tickSize = [3, 'hour'];
    this.flotOptions= this.flotOptionsTemplate;
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
    let orders = new List<Order>(snapshots.filter(s => s.date > currentDay));
        
        // let income = snapshots.map(s => [s.date, s.orderSum]);
        // income =  income.sort((a, b) => {
        //   if (a[0] < b[0]) {return -1; }
        //   if (a[0] > b[0]) {return 1; }
        //   return 0;
        // });
        // console.log(income);
        
        // let letOrdersData = snapshots.map(s => [s.date, 1]);
        // letOrdersData =  letOrdersData.sort((a, b) => {
        //   if (a[0] < b[0]) {return -1; }
        //   if (a[0] > b[0]) {return 1; }
        //   return 0;
        // });
        let income = this.prepareDatasetForChartIncome(orders,this.getHoursOfTimeStamp);
        let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getHoursOfTimeStamp);
        console.log(income);
        console.log(letOrdersData);
        // this.flotOptions.yaxes[0].max = 70;
        // this.flotOptions.yaxes[1].max = 100;

        setTimeout(() => {
          this.updateChartDatasets(letOrdersData, income);
        }, 2000);
      });
  }
}
