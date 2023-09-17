import { sentenceCase } from 'change-case';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
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
import Iconify from '../components/Iconify';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user/list';

// ----------------------------------------------------------------------

const TABLE_HEAD2 = [
  { id: 'reportedDate', label: 'Reported Date', alignRight: false },
  { id: 'marketValue', label: 'Market Value (USD)', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'realisedProfitLoss', label: 'Realised P/L (USD)' , alignRight: false },
]

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------

export default function Funds() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const [userList, setUserList] = useState(_userList);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fundList, setFundList] = useState([]);
  const [fundName, setFundName] = useState("");
  const [instrumentName, setInstrumentName] = useState("");
  const [instrumentList, setInstrumentList] = useState([]);
  const [compositeList, setCompositeList] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const dicto = {}

  useEffect(() => {
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/funds`).then(res => {
      const data = res.data.filter((fund) => String(fund.fundId) === id)
      const result = data.filter((fund) => {
        if (!dicto[fund.instrumentId]) {
          dicto[fund.instrumentId] = true
          return true
        }
        return false
      })
      setFundList(result);
    });
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/instruments`).then(res => {
      setInstrumentList(res.data);
    });
  }, []);

  const TAB_HEAD2 = [
    { id: 'instrumentName', label: 'Instrument Name', alignRight: false },
    { id: 'instrumentType', label: 'Instrument Type', alignRight: false },
    { id: 'currency', label: 'Currency', alignRight: false },
    { id: 'country', label: 'Country', alignRight: false },
    { id: 'industry', label: 'Industry', alignRight: false },
    { id: 'sector', label: 'Sector', alignRight: false },
  ]

  useEffect(() => {
    if (instrumentList && fundList) {
      const dicto1 = {}
      instrumentList.forEach((instrument) => {
        dicto1[String(instrument.instrumentId)] = instrument
        if (String(instrument.instrumentId) === String(instrumentId)) {
          setInstrumentName(instrument.instrumentName)
        }
      })
      const res = fundList.map((fund) => {
        setFundName(fund.fundName)
        return {
          ...fund,
          ...dicto1[String(fund.instrumentId)]
        }
      })
      setCompositeList(res)
    }
  }, [instrumentList, fundList])
  
  useEffect(()  => {
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/funds/${id}/instruments/${instrumentId}`).then(res => {
        console.log("SADASDASD", res.data)
        setProfitData(res.data);
      });
  }, [])

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = fundList.map((n) => n.fundId);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  let counter = 0

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

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteUser = (userId) => {
    const deleteUser = userList.filter((user) => user.id !== userId);
    setSelected([]);
    setUserList(deleteUser);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  // const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);
  const filteredInstruments = applySortFilter(fundList, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredInstruments.length && Boolean(filterName);
  const [file, setFile] = useState(null);
  const { id, instrumentId } = useParams();
  
  return (
    <>
      <Page title="Funds">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Funds"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Funds', href: PATH_DASHBOARD.general.funds},
              { name: `${fundName}`, href: `${PATH_DASHBOARD.general.funds}/${id}` },
              { name: `${instrumentName}`}
            ]}
            action={
              <Button
                variant="contained"
                onClick={() => {
                    axios.post(`${process?.env.REACT_APP_BACKEND_URL}/funds/${id}/refresh`).then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(err)
                    })
                }}
                startIcon={<Iconify icon={'eva:refresh-fill'} />}
              >
               Refresh Position
              </Button>
            }
          />

          <Card>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD2}
                    rowCount={fundList.length}
                    align="center"
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {profitData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const {  quantity, reportedDate, realisedProfitLoss, marketValue } = row;
                      // const isItemSelected = selected.indexOf(instrumentName) !== -1;
                        const newConst = counter
                        counter += 1
                      return (
                        
                        <TableRow
                          hover
                          key={newConst}
                        >
                          {/* <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onClick={() => handleClick(instrumentName)} />
                          </TableCell> */}
                          <TableCell
                          >{reportedDate}</TableCell>
                          <TableCell>
                            {quantity}
                          </TableCell>
                          <TableCell>
                            {marketValue}
                          </TableCell>
                          <TableCell>
                            {realisedProfitLoss}
                          </TableCell>
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
              count={profitData.length}
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
