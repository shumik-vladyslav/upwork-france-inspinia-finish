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

  public flotOptions: any =
  {
    xaxis: {
      mode: "time",
      tickSize: [30, "day"],
      tickLength: 0,
      axisLabel: "Date",
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Arial',
      axisLabelPadding: 10,
      color: "#d5d5d5"
    },
    yaxes: [{
      position: "left",
      max: 30,
      color: "#d5d5d5",
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Arial',
      axisLabelPadding: 3
    }, {
      max: 30,
      position: "right",
      clolor: "#d5d5d5",
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: ' Arial',
      axisLabelPadding: 67
    }
    ],
    legend: {
      noColumns: 1,
      labelBoxBorderColor: "#000000",
      position: "nw"
    },
    grid: {
      hoverable: false,
      borderWidth: 0
    }
  };


  projects: FirebaseListObservable<any[]>;

  public constructor(public db: AngularFireDatabase) {
    this.nav = document.querySelector('nav.navbar');

    this.projects = db.list('/projects');

    // todo visits save to user
    // this.visits = client.visits;

    this.ordersTable2 = db.list('/orders');

    // income chart
    this.daySort();

    this.ordersTable = db.list('/orders').subscribe(snapshots => {
      this.income = 0;
      this.orders = 0;
      this.orderPercent = 0;
      this.lastOrderPercent = 0;
      this.totalOrderPercent = 0;

      this.sumCurrentMonth = 0;
      this.sumLastMonth = 0;
      ////
      let now = new Date();
      let lastMonth = new Date (now.getFullYear(), now.getMonth()).getMonth();
      let prevMonth = new Date (now.getFullYear(), now.getMonth() - 1).getMonth();

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

 updateChartDatasets (orders, income = []) {
    this.flotDataset = [
        {
          label: 'Number of orders',
          data: orders,
          color: '#1ab394',
          bars: {
            show: true,
            align: 'center',
            barWidth: 24 * 60 * 60 * 600,
            lineWidth: 0
          }
        },
        {
          label: 'Income',
          data: income,
          color: '#1c84c6',
          points: { symbol: 'triangle'}
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
    const originTime = 0;
    const offsetOriginTime = originTime + new Date().getTimezoneOffset() * 60 * 1000;
    const timeSinceOrigin = time - offsetOriginTime;
    const timeModulo = timeSinceOrigin % (24 * 60 * 60 * 1000);
    const normalizedTime = time - timeModulo;

    console.log(new Date(normalizedTime) , new Date(time));
    return normalizedTime;
  }

  getHoursOfTimeStamp(time) {
    const originTime = 0;
    const offsetOriginTime = originTime + new Date().getTimezoneOffset() * 60 * 1000;
    const timeSinceOrigin = time - offsetOriginTime;
    const timeModulo = timeSinceOrigin % (60 * 60 * 1000);
    const normalizedTime = time - timeModulo;

    console.log(new Date(normalizedTime) , new Date(time));
    return normalizedTime;
  }

  getMonthOfTimeStamp(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth());
  }

  prepareDatasetForChartIncome(orders: List<Order>, roundDataFunction){
    let result = orders.GroupBy(order => roundDataFunction(order.date),  o => o.orderSum);
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

  prepareDatasetForChartOrders(orders: List<Order>, roundDataFunction){
    let result = orders.GroupBy(order => roundDataFunction(order.date),  o => 1);
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

  monthSort() {
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
        let orders = new List<Order>(snapshots);
        let income = this.prepareDatasetForChartIncome(orders, this.getDateOfTimeStamp);
        let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getDateOfTimeStamp);

        // this.flotOptions.yaxes[0].max = 70;
        // this.flotOptions.yaxes[1].max = 100;

        setTimeout(() => {
          this.updateChartDatasets(letOrdersData, income);
        }, 2000);
      });
  }

  yearsSort() {
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

  daySort() {
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
      let orders = new List<Order>(snapshots);
        let income = this.prepareDatasetForChartIncome(orders, this.getHoursOfTimeStamp);
        let letOrdersData = this.prepareDatasetForChartOrders(orders, this.getHoursOfTimeStamp);

        // this.flotOptions.yaxes[0].max = 70;
        // this.flotOptions.yaxes[1].max = 100;

        setTimeout(() => {
          this.updateChartDatasets(letOrdersData, income);
        }, 2000);
      });
  }
}
