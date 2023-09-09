import { sentenceCase } from 'change-case';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardHeader,
  Table,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  TextField,
  Modal,
  Stack,
  Link,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// routes
import { PATH_DASHBOARD } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// _mock_
import { _userList } from '../_mock';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import { BaseOptionChart } from '../components/chart';
import Iconify from '../components/Iconify';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user/list';

// ----------------------------------------------------------------------

let TABLE_HEAD2 = [
  { id: 'reportedDate', label: 'Reported Date', alignRight: false },
  { id: 'unitPrice', label: 'Unit Price', alignRight: false },
  { id: ''}
]

const dateLabels = [
  '10/01/2022',
  '11/01/2022',
  '12/01/2022',
  '01/01/2023',
  '02/01/2023',
  '03/01/2023',
  '04/01/2023',
  '05/01/2023',
  '06/01/2023',
  '07/01/2023',
  '08/01/2023',
  '09/01/2023',
]


// ----------------------------------------------------------------------
function InstrumentPriceChart(chartData, instrument) {
  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: [0, 2, 3] },
    plotOptions: { bar: { columnWidth: '14%' } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: [
      '10/01/2022',
      '11/01/2022',
      '12/01/2022',
      '01/01/2023',
      '02/01/2023',
      '03/01/2023',
      '04/01/2023',
      '05/01/2023',
      '06/01/2023',
      '07/01/2023',
      '08/01/2023',
      '09/01/2023',
    ],
    xaxis: { type: 'datetime' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(3)} ${instrument?.currency ?? ''}`;
          }
          return y;
        },
      },
    },
  });
  return (
    <Card>
      <CardHeader title="Price (YTD)"/>
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={chartData?.chartData ?? []} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
export default function InstrumentPrices() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const [userList, setUserList] = useState(_userList);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('reportedDate');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [instrumentList, setInstrumentList] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [instrument, setInstrument] = useState(null);
  const { id } = useParams();
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/price-values/${id}`).then(res => {
      if (res.data) {
        setPriceList(res.data);
      }
    });

    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/instruments/${id}`).then(res => {
      if (res.data) {
        setInstrument(res.data);
        TABLE_HEAD2 = [
          { id: 'reportedDate', value: 'reportedDate', label: 'Reported Date', alignRight: false },
          { id: 'unitPrice', value: 'unitPrice', label: `Unit Price (${res.data?.currency})`, alignRight: false },
        ]
      }
    });
  }, []);
  useEffect(() => {
    if (instrument && priceList) {
      const toAdd = {}
      toAdd.name = instrument.instrumentName;
      toAdd.type = 'area';
      const dicto = {
        '10/01/2022': true,
        '11/01/2022': true,
        '12/01/2022': true,
        '01/01/2023': true,
        '02/01/2023': true,
        '03/01/2023': true,
        '04/01/2023': true,
        '05/01/2023': true,
        '06/01/2023': true,
        '07/01/2023': true,
        '08/01/2023': true,
        '09/01/2023': true,
      }
      const sortedPriceList = priceList.sort((a, b) => new Date(b.reportedDate)- new Date(a.reportedDate));
      const added = {}
      const e = sortedPriceList.filter((price) => {
        const d = new Date(price.reportedDate);
        const monthString = d.getMonth() + 1< 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
        if (dicto[`${monthString}/01/${d.getFullYear()}`]) {
          if (!added[`${monthString}/01/${d.getFullYear()}`]) {
            added[`${monthString}/01/${d.getFullYear()}`] = true;
            dicto[`${monthString}/01/${d.getFullYear()}`] = price.unitPrice;
            return true
          }
        }
        return false
      })
      console.log(e, dicto)
      const chartD = []
      dateLabels.forEach((e) => {
        console.log(e, dicto)
        if (dicto[e] !== true) {
          chartD.push(dicto[e])
        } else {
          chartD.push(0)
        }
      })
      setChartData([{
        name: instrument.instrumentName,
        type: "bar",
        data: chartD
      }])
    }
  }, [instrument, priceList])
  const handleRequestSort = (property) => {
    const p = property.target.innerText.split(" ")[0] === "Reported" ? 'reportedDate' : 'unitPrice';
    const isAsc = orderBy === p && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(p);

  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = instrumentList.map((n) => n.instrumentName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  // const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);
  const filteredInstruments = applySortFilter(instrumentList, getComparator(order, orderBy), filterName);
  const filteredPrices = applySortFilter(priceList, getComparator(order, orderBy));
  const isNotFound = !priceList.length;
  return (
    <>
      <Page title="User: List">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Instruments"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Instruments', href: PATH_DASHBOARD.general.instruments },
              { name: instrument ? `${instrument?.instrumentName} Prices` : "Instrument Prices", },
            ]}
          />
          <InstrumentPriceChart chartData={chartData} instrument={instrument} />

          <Card>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD2}
                    rowCount={priceList?.length}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {filteredPrices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { instrumentId, reportedDate, unitPrice  } = row;
                      const id = String(instrumentId);
                      return (
                        <TableRow
                          hover
                          key={id}
                          component={Link}
                          onClick={() => navigate(`/dashboard/instruments/${id}`)}
                          to={`/dashboard/instruments/${id}`}
                        >
                          <TableCell align="left">{reportedDate}</TableCell>
                          <TableCell align="left">{unitPrice}</TableCell>
                        </TableRow>
                        
                      );
                    })}
                  </TableBody>
                  {isNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterName} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={priceList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, page) => setPage(page)}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </Page>
    </>
  );
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return array.filter((instrument) => instrument.instrumentName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
