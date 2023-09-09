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
  { id: 'instrumentName', label: 'Instrument Name', alignRight: false },
  { id: 'instrumentType', label: 'Instrument Type', alignRight: false },
  { id: 'currency', label: 'Currency', alignRight: false },
  { id: 'country', label: 'Country', alignRight: false },
  { id: 'industry', label: 'Industry', alignRight: false },
  { id: 'sector', label: 'Sector', alignRight: false },
  { id: 'createdAt', label: 'Created At', alignRight: false},
  { id: 'lastModified', label: 'Last Modified', alignRight: false},
  { id: 'edit', label: 'Edit', alignRight: false },
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

export default function Instrument() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const [userList, setUserList] = useState(_userList);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [instrumentList, setInstrumentList] = useState([]);

  const submitFile = async() => {
    const formData = new FormData();
    formData.append("file", file)
    await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/ingestor`, formData, {})

    window.location.reload()
  }

  useEffect(() => {
    axios.get(`${process?.env.REACT_APP_BACKEND_URL}/instruments`).then(res => {
      const data = res.data.map((instrument) => {
        return {
          ...instrument,
          id: String(instrument.instrumentId),
        }
      })
      setInstrumentList(data);

    });
  }, []);
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = instrumentList.map((n) => n.instrumentName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
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
  const filteredInstruments = applySortFilter(instrumentList, getComparator(order, orderBy), filterName);
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
  return (
    <>
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <form id="edit-instrument-form">
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{paddingBottom: 2, textAlign: "center"}}>
              Edit Instrument
            </Typography>
            <FormControl sx={{width: "100%"}}>
              <TextField
                id="edit-instrument-id"
                label="Instrument ID"
                variant="outlined"
                value={editInstrumentId}
                onChange={(e) => setEditInstrumentId(e.target.value)}
                sx={{paddingBottom: 2}}
                disabled
              />
              <TextField
                id="edit-instrument-country"
                label="Country"
                variant="outlined"
                required
                value={editInstrumentCountry}
                onChange={(e) => setEditInstrumentCountry(e.target.value)}
                sx={{paddingBottom: 2}}
              />
              <TextField
                id="edit-instrument-sector"
                label="Sector"
                variant="outlined"
                required
                value={editInstrumentSector}
                onChange={(e) => setEditInstrumentSector(e.target.value)}
                sx={{paddingBottom: 2}}
              />
              <TextField
                id="edit-instrument-type"
                label="Type"
                required
                variant="outlined"
                value={editInstrumentType}
                onChange={(e) => setEditInstrumentType(e.target.value)}
                sx={{paddingBottom: 2}}
              />
               <Button
                  type="submit"
                >
                submit
              </Button>
            </FormControl>
          </Box>
        </form>
      </Modal>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{paddingBottom: 2, textAlign: "center"}}>
            Upload CSV
          </Typography>
          <form id="upload-csv-form" onSubmit="event.preventDefault();">
            <FormControl sx={{width: "100%"}}>
              <Button
                variant="contained"
                component="label"
                paddingBottom={2}
                textAlign="center"
              >
                <input
                  id='upload-csv-input'
                  type="file"
                  accept='.csv'
                  required
                  onChange={handleFileChange}
                  style={{textAlign: "center"}}
                />
              </Button>
              <Button 
                onClick={submitFile}
              >
                submit
              </Button>
            </FormControl>
          </form>
        </Box>
      </Modal>
      <Page title="User: List">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          
          <HeaderBreadcrumbs
            heading="Instruments"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Instruments' },
            ]}
            action={
              <Button
                variant="contained"
                onClick={() => setModalOpen(!modalOpen)}
                startIcon={<Iconify icon={'eva:cloud-upload-outline'} />}
              >
                Add CSV
              </Button>
            }
          />

          <Card>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            />

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD2}
                    rowCount={instrumentList.length}
                    // numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredInstruments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, instrumentName, instrumentType, currency, country, industry, sector, createdAt, modifiedAt} = row;
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
                            align="left"
                            component={Link}
                            onClick={() => navigate(`/dashboard/instruments/${id}`)}
                            to={`/dashboard/instruments/${id}`}
                          >{instrumentName}</TableCell>
                          <TableCell align="left">{instrumentType}</TableCell>
                          <TableCell align="left">{currency}</TableCell>
                          <TableCell align="left">{country}</TableCell>
                          <TableCell align="left">{industry}</TableCell>
                          <TableCell align="left">{sector}</TableCell>
                          <TableCell align="left">{createdAt}</TableCell>
                          <TableCell align="left">{modifiedAt}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                setEditInstrumentId(id);
                                setEditInstrumentCountry(country);
                                setEditInstrumentSector(sector);
                                setEditInstrumentType(instrumentType);
                                setEditModalOpen(true);
                              }}
                            >
                              <Iconify icon={'eva:edit-outline'} />
                            </Button>
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
