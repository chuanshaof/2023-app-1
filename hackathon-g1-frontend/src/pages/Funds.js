import { sentenceCase } from 'change-case';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

const TABLE_HEAD2 = [
  { id: 'fundId', label: 'Fund ID', alignRight: false },

  { id: 'fundName', label: 'Fund Name', alignRight: false },
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [fundList, setFundList] = useState([]);

  useEffect(() => {
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/funds`).then(res => {
      const data = res.data.map((fund) => {
        return {
          fundName: fund.fundName,
          id: String(fund.fundId),
        }
      })
      const dicto = {}
      const result = data.filter((fund) => {
        if (!dicto[fund.id]) {
          dicto[fund.id] = fund
          return true
        }
        return false
      })
      setFundList(result);
    });
  }, []);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editInstrumentId, setEditInstrumentId] = useState(null);
  const [editInstrumentCountry, setEditInstrumentCountry] = useState(null);
  const [editInstrumentSector, setEditInstrumentSector] = useState(null);
  const [editInstrumentType, setEditInstrumentType] = useState(null);
  const [file, setFile] = useState(null);
  const handleFileChange = async (e) => {
    if (e.target.files) {
      try {
        const fileData = e.target.files[0];
        // // 1. create url from the file
        // const fileUrl = URL.createObjectURL(fileData);
        // // 2. use fetch API to read the file
        // const response = await fetch(fileUrl);
        // // 3. get the text from the response
        // const text = await response.text();
        // const lines = text.split("\n");
        // const _data = lines.map((line) => line.split(","));
        setFile(fileData)

      } catch (error) {
        console.error(error);
      }
    }
  };

  const submitFile = async() => {
      const formData = new FormData();
      formData.append("file", file)
      await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/ingestor`, formData, {})

      window.location.reload()
  }

  return (
    <>
      <Page title="Funds">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Funds"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Funds' },
            ]}
            // action={
            //   <Button
            //     variant="contained"
            //     onClick={() => {}}
            //     startIcon={<Iconify icon={'eva:refresh-fill'} />}
            //   >
            //    Refresh Position
            //   </Button>
            // }
          />

          <Card>
            {/* <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            /> */}

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD2}
                    rowCount={fundList.length}
                    // align="center"
                    // numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredInstruments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, fundName } = row;
                      // const isItemSelected = selected.indexOf(instrumentName) !== -1;
  
                      return (
                        
                        <TableRow
                          hover
                          key={id}
                        >
                          {/* <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onClick={() => handleClick(instrumentName)} />
                          </TableCell> */}
                          <TableCell
                            // align="center"
                            component={Link}
                            onClick={() => navigate(`/dashboard/funds/${id}`)}
                            to={`/dashboard/funds/${id}`}
                          >{id}</TableCell>
                          <TableCell
                            // align="center"
                            component={Link}
                            onClick={() => navigate(`/dashboard/funds/${id}`)}
                            to={`/dashboard/funds/${id}`}
                          >{fundName}</TableCell>
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
              count={filteredInstruments.length}
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
