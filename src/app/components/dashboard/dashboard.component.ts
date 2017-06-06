import { Component, OnDestroy, OnInit, } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { FlotChartDirective } from '../../components/charts/flotChart';
import { Cookie } from 'ng2-cookies';
import { footable } from '../../app.helpers';

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
      max: 100,
      color: "#d5d5d5",
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Arial',
      axisLabelPadding: 3
    }, {
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
      this.totalOrderPercent = (lastMonthOrders - prevMonthOrders) / prevMonthOrders * 100;

      this.income = lastMonthIncome;
      this.incomePercent = (lastMonthIncome - prevMonthIncome) / prevMonthIncome * 100;
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

  monthSort() {
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
        const ordersDataset: any[] = [];
        const incomeDtataset: any[] = [];
        // todo get current day data without hours and ...
        let now = new Date();
        let lastMonth = new Date (now.getFullYear(), now.getMonth());

        let maxOrdCount = 0;
        let maxIncome = 0;
        let prevDate = -1;
        let orderAcc = 0;
        let incomeAcc = 0;

        for (var index = 0; index < snapshots.length; index++) {
          var snapshot = snapshots[index];
          let orderDate = new Date(snapshot.date);
          if (orderDate < lastMonth) {
            const date: number = orderDate.getDate();
            incomeDtataset.push([date, incomeAcc]);
            ordersDataset.push([date, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = ordersDataset[date];
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevDate = date;
            continue;
          }

          const date: number = orderDate.getDate();
          if (prevDate === -1) {
            prevDate = date;
          }

          if (prevDate == date) {
            orderAcc += 1;
            incomeAcc += snapshot.orderSum;
          } else {
            incomeDtataset.push([date, incomeAcc]);
            ordersDataset.push([date, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = orderAcc;
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevDate = date;
          }
        }
        console.log(ordersDataset);
        console.log(maxOrdCount);

        this.flotOptions.yaxes[0].max = maxOrdCount;
        this.flotOptions.yaxes[1].max = maxIncome;
        setTimeout(() => {
          this.updateChartDatasets(ordersDataset, incomeDtataset);
        }, 2000);
      });
  }

  yearsSort() {
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
        const ordersDataset: any[] = [];
        const incomeDtataset: any[] = [];
        // todo get current day data without hours and ...
        let now = new Date();
        let lastYear = new Date (now.getFullYear());

        let maxOrdCount = 0;
        let maxIncome = 0;
        let prevMonth = -1;
        let orderAcc = 0;
        let incomeAcc = 0;

        for (var index = 0; index < snapshots.length; index++) {
          var snapshot = snapshots[index];
          let orderDate = new Date(snapshot.date);
          if (orderDate < lastYear) {
            const month: number = orderDate.getMonth();
            incomeDtataset.push([month, incomeAcc]);
            ordersDataset.push([month, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = ordersDataset[month];
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevMonth = month;
            continue;
          }

          const month: number = orderDate.getMonth();
          if (prevMonth === -1) {
            prevMonth = month;
          }

          if (prevMonth == month) {
            orderAcc += 1;
            incomeAcc += snapshot.orderSum;
          } else {
            incomeDtataset.push([month, incomeAcc]);
            ordersDataset.push([month, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = orderAcc;
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevMonth = month;
          }
        }
        console.log(ordersDataset);
        console.log(maxOrdCount);

        this.flotOptions.yaxes[0].max = maxOrdCount;
        this.flotOptions.yaxes[1].max = maxIncome;
        setTimeout(() => {
          this.updateChartDatasets(ordersDataset, incomeDtataset);
        }, 2000);
      });
  }

  daySort() {
    this.ordersTable = this.db.list('/orders').subscribe(snapshots => {
        const ordersDataset: any[] = [];
        const incomeDtataset: any[] = [];
        // todo get current day data without hours and ...
        let now = new Date();
        let lastDay = new Date (now.getFullYear(), now.getMonth(), now.getDate());

        let maxOrdCount = 0;
        let maxIncome = 0;
        let prevHours = -1;
        let orderAcc = 0;
        let incomeAcc = 0;

        for (var index = 0; index < snapshots.length; index++) {
          var snapshot = snapshots[index];
          let orderDate = new Date(snapshot.date);
          if (orderDate < lastDay) {
            const hours: number = orderDate.getHours();
            incomeDtataset.push([hours, incomeAcc]);
            ordersDataset.push([hours, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = ordersDataset[hours];
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevHours = hours;
            continue;
          }

          const hours: number = orderDate.getHours();
          if (prevHours === -1) {
            prevHours = hours;
          }

          if (prevHours == hours) {
            orderAcc += 1;
            incomeAcc += snapshot.orderSum;
          } else {
            incomeDtataset.push([hours, incomeAcc]);
            ordersDataset.push([hours, orderAcc]);
            if ( orderAcc > maxOrdCount) {
              maxOrdCount = orderAcc;
            }
            if ( incomeAcc > maxIncome) {
              maxIncome = incomeAcc;
            }
            incomeAcc = 0;
            orderAcc = 0;
            prevHours = hours;
          }
        }
        console.log(ordersDataset);
        console.log(maxOrdCount);

        this.flotOptions.yaxes[0].max = maxOrdCount;
        this.flotOptions.yaxes[1].max = maxIncome;
        setTimeout(() => {
          this.updateChartDatasets(ordersDataset, incomeDtataset);
        }, 2000);
      });
  }
}
