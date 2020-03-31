import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {OrdersService} from '@core/services/orders.service';
import {CommonService} from '@core/services/common.service';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {Socket} from 'ngx-socket-io';
import {SubjectService} from '@core/services/subject.service';
import {Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {DriverAssignmentDialogComponent} from '@core/components/dialogs/driver-assignment-dialog/driver-assignment-dialog.component';
import * as jwtDecode from 'jwt-decode';
import {ORDERS_TABLE_COLUMNS} from '@core/constants/settings';

@Component({
  selector: 'app-mat-orders-table',
  templateUrl: './mat-orders-table.component.html',
  styleUrls: ['./mat-orders-table.component.scss']
})
export class MatOrdersTableComponent implements OnInit, OnDestroy {
  @Input() status;
  @Output() socketStateChanged = new EventEmitter();
  displayedColumns = ORDERS_TABLE_COLUMNS;
  dataSource;
  filteredData;
  subscriptions: Subscription[] = [];
  authUser;
  isOperator;
  orderTaken = false;
  orderStarted = false;
  userPosition;


  constructor(
    private ordersService: OrdersService,
    public common: CommonService,
    private toastr: ToastrService,
    private subject: SubjectService,
    public socket: Socket,
    public router: Router,
    public auth: AuthService,
    private matDialog: MatDialog
  ) {
  }

  ngOnInit() {

    this.getUserType();
    this.getColumnsByUserPosition();
    this.getOrders();
    this.handleSocketEvents();

    // Getting orders of the changed tab
    this.subject.getOrderTypeData().subscribe(status => {
      this.status = status;
      this.getOrders();
    });


  }

  getColumnsByUserPosition() {
    const position = this.authUser.position.name;

    if (position === 'Customer') {
      this.displayedColumns = this.displayedColumns.filter(col => !/_id|client_full_name|phone|email|actions/i.test(col));
    } else if (position === 'Director' || position === 'Operator') {
    }
  }

  handleSocketEvents() {
    this.socket.on('driverAssignmentFinished', (res) => {
      if (this.isOperator) {
        this.toastr.success(`The order of customer <strong>${res.client.first_name} ${res.client.last_name}</strong>
            has been assigned to <strong>${res.driver.full_name}</strong>`,
          '', {enableHtml: true});
      } else if (this.authUser.position.name === 'Customer') {
        this.toastr.success(`Your order has been assigned to <strong>${res.driver.full_name}</strong>`,
          '', {enableHtml: true, disableTimeOut: true});
      } else if (this.authUser.position.name === 'Driver') {
        this.toastr.success(`The order of customer <strong>${res.client.first_name} ${res.client.last_name}</strong>
            has been assigned to you</strong>`,
          '', {enableHtml: true});
      }

      this.getOrders();
      this.socketStateChanged.emit();
    });

    this.socket.on('orderCreated', (data) => {
      const customer = data.order.client;
      if (customer && this.isOperator) {
        this.toastr.success(`A new order has been created by: <strong>${customer.first_name}  ${customer.last_name}</strong>`,
          'Order created!', {enableHtml: true});
      }
      this.socketStateChanged.emit();
      this.getOrders();
    });


    this.socket.on('orderTakenFinished', (data) => {
      if (this.isOperator) {
        this.toastr.success(`The order of customer <strong>${data.client.first_name} ${data.client.last_name}</strong>
            has been taken by <strong>${data.driver.full_name}</strong>`,
          '', {enableHtml: true});
      } else if (this.authUser.position.name === 'Customer') {
        this.toastr.success(`Your order has been taken by <strong>${data.driver.full_name}</strong>`,
          '', {enableHtml: true, disableTimeOut: true});
      }

      this.socketStateChanged.emit();
      this.getOrders();
    });
    this.socket.on('arrivedToOrderFinished', (data) => {
      if (this.isOperator) {
        this.toastr.success(`<strong>${data.driver.full_name}</strong>
        is arrived to the location of <strong>${data.client.first_name} ${data.client.last_name}</strong>`,
          '', {enableHtml: true});
      } else if (this.authUser.position.name === 'Customer') {
        this.toastr.success(`The boat is arrived. Please get on the board and have a nice trip! Thank you!`,
          '', {enableHtml: true, disableTimeOut: true});
      }
      this.socketStateChanged.emit();
      this.getOrders();
    });

    this.socket.on('orderStarted', (data) => {
        if (this.isOperator) {
          this.toastr.success(`The order of customer <strong>${data.client.first_name} ${data.client.last_name}</strong>
            has been started by <strong>${data.driver.full_name}</strong>`,
            '', {enableHtml: true});
        }
        this.socketStateChanged.emit();
        this.getOrders();
      }
    );

    this.socket.on('orderFinished', (data) => {
      if (this.isOperator) {
        this.toastr.success(`The order of customer <strong>${data.client.first_name} ${data.client.last_name}</strong>
              has been finished by <strong>${data.driver.full_name}</strong>`,
          '', {enableHtml: true});
      }
      this.socketStateChanged.emit();
      this.getOrders();
    });

    this.socket.on('ratedDriver', (data) => {
      console.log(data)
    });
  }

  getUserType() {
    const token = localStorage.getItem('token');
    if (token) {

      this.authUser = jwtDecode(token);
      this.isOperator = /Operator|Director/i.test(this.authUser.position.name);
      this.userPosition = this.authUser.position.name;
    }
  }

  getOrders() {
    const sendData = {status: this.status};
    if (this.userPosition === 'Driver') {
      sendData['driverEmail'] = this.authUser.email;
    } else if (this.userPosition === 'Customer') {
      sendData['customerEmail'] = this.authUser.email;
    }
    this.subscriptions.push(this.ordersService.get(sendData).subscribe(dt => {
      this.common.dataLoading = false;
      this.dataSource = dt;
    }));
  }


  normalizeColName(col): string {
    col = `${col[0].toUpperCase()}${col.slice(1)}`;
    return col.replace(/_/g, ' ');
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.filteredData = this.dataSource.filteredData;
    // console.log(this.dataSource)
  }

  assignToDriver(row) {
    this.matDialog.open(DriverAssignmentDialogComponent, {
      data: {order_id: row._id},
      width: '500px',
      height: '400px'
    }).afterClosed().subscribe(dt => {
      if (dt) {
        const client = row.client;
        row['driver'] = dt.driver;
        row['ferry'] = dt.ferry;
        this.socket.emit('driverAssigned', {driverOrder: dt, selectedOrder: row});

        this.socket.on('driverAssignmentFinished', (res) => {
          if (res) {
            this.toastr.success(`The order of customer <strong>${client.first_name} ${client.last_name}</strong>
            has been assigned to <strong>${dt.driver.full_name}</strong>`,
              '', {enableHtml: true})
            this.getOrders();
          }
        });
      }
    });
  }


  takeOrder(order) {
    this.orderTaken = true;
    this.socket.emit('orderTaken', order);
    this.getOrders();
    console.log(order)
  }

  arrivedToOrder(order) {
    this.socket.emit('arrivedToOrder', order);
    this.getOrders();
  }

  startOrder(order) {
    this.orderStarted = true;
    this.socket.emit('startOrder', order);
    this.getOrders();
  }

  finishOrder(order) {
    this.orderTaken = false;
    this.socket.emit('finishOrder', order);
    this.getOrders();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
