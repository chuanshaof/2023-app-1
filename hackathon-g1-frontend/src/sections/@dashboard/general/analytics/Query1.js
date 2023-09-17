import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import {useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';
// @mui
import { TableContainer, TablePagination, Box,TableCell, Table, Link, TableRow, TableBody,Card, CardHeader, Container, Typography, Stack, TextField, Button, InputLabel, FormControl, MenuItem } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select, { SelectChangeEvent } from '@mui/material/Select';



import axios from 'axios'
// hooks

// @mui
import { useTheme, styled } from '@mui/material/styles';
// utils
import { fNumber } from '../../../../utils/formatNumber';
//
import SearchNotFound from '../../../../components/SearchNotFound';

import { BaseOptionChart } from '../../../../components/chart';
import useSettings from '../../../../hooks/useSettings';
import Scrollbar from '../../../../components/Scrollbar';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../user/list';

// sections

// ----------------------------------------------------------------------
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

const fundIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const SomeChart = (filterType) => {

    const instrumentCollection = [];

    console.log(filterType.filter)


    if(filterType.filter === "instruments"){
        filterType.data.values.map((e, index) => instrumentCollection.push({
            "instrumentId" : filterType.data.types[index],
            "marketValue" : e
        }))
    }

    console.log(instrumentCollection);

    const TABLE_HEAD2 = [
        { id: 'instrumentId', label: 'Instrument ID', alignRight: false },
        { id: 'marketValue', label: 'Market Value', alignRight: false },
      ]
      const navigate = useNavigate();
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const isNotFound = false;
    const { themeStretch } = useSettings();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const theme = useTheme();
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };
    const chartOptions = merge(BaseOptionChart(), {
      colors: [
        theme.palette.primary.main,
        theme.palette.chart.blue[0],
        theme.palette.chart.violet[0],
        theme.palette.chart.yellow[0],
      ],
      labels: filterType.data.types,
      stroke: { colors: [theme.palette.background.paper] },
      legend: { floating: true, horizontalAlign: 'center' },
      dataLabels: { enabled: true, dropShadow: { enabled: false } },
      tooltip: {
        fillSeriesColor: false,
        y: {
          formatter: (seriesName) => fNumber(seriesName),
          title: {
            formatter: (seriesName) => `${seriesName}`,
          },
        },
      },
      plotOptions: {
        pie: { donut: { labels: { show: false } } },
      },
    });
    

    return (<>
    {filterType.filter === "sector" || filterType.filter === "country" ?

      <Card>
        { filterType.filter === "sector" ? <CardHeader title="Breakdown by Sector" />  : <CardHeader title="Breakdown by Country" /> }

        <ChartWrapperStyle dir="ltr">
          <ReactApexChart type="pie" series={filterType.data.values} options={chartOptions} height={280} />
        </ChartWrapperStyle>
      </Card> : 
            <Container maxWidth={themeStretch ? false : 'lg'}>

  
            <Card>
              {/* <UserListToolbar
                numSelected={selected.length}
                // filterName={filterName}
              /> */}
  
              <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                    <Typography>Breakdown by Instrument</Typography>
                  <Table>
                    <UserListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD2}
                      rowCount={instrumentCollection.length}
                      // numSelected={selected.length}
                    //   onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                      {instrumentCollection.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                        const { instrumentId, marketValue } = row;
                        // const isItemSelected = selected.indexOf(instrumentName) !== -1;
    
                        return (
                          
                          <TableRow
                            hover
                            key={instrumentId}
                          >
                            {/* <TableCell padding="checkbox">
                              <Checkbox checked={isItemSelected} onClick={() => handleClick(instrumentName)} />
                            </TableCell> */}
                            <TableCell
                              align="left"
                              component={Link}
                              onClick={() => navigate(`/dashboard/instruments/${instrumentId}`)}
                              to={`/dashboard/instruments/${instrumentId}`}
                            >{instrumentId}</TableCell>
                            <TableCell
                              align="left"
                            >{marketValue}</TableCell>
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
                count={instrumentCollection.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, page) => setPage(page)}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          </Container>

    }
    </>
    );
  }

export default function Query1() {
    const { themeStretch } = useSettings();
    const [data, setData] = useState(null);
    const [fundId, setFundId] = useState([]);
    const [type, setType] = useState(null);
    //   const [instrumentId, setInstrumentId] = useState(-1);
    const [country, setCountry] = useState("");
    const [sector, setSector] = useState("");
    const [startDate, setStartDate] = useState(null);
    //   const [endDate, setEndDate] = useState(null);

    const handleFundChange = (e) => {
        setFundId(e.target.value)
    }

    //   const handleInstrumentChange = (e) =>{
    //     setInstrumentId(e.target.value)
    //   }
    // const handleCountryChange = (e) => {
    //     setCountry(e.target.value)
    // }
    // const handleSectorChange = (e) => {
    //     setSector(e.target.value)
    // }

    const handleTypeChange = (e) => {
        setType(e.target.value)
        setData(null)
    }


    const handleQuery = async () => {
        const query = {
            "fund_id": fundId,
            "type" : type,
            "date": startDate.toISOString().split("T")[0],
        }
        sessionStorage.setItem("query1", query);
        await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/analytics/breakdown`, query).then(
            res => {
                console.log(res.data)
                setData(res.data);
            }

        )
        
    }

    // useEffect(() => {
    //   axios.get("http://ec2-54-169-209-187.ap-southeast-1.compute.amazonaws.com/routers").then(res => {
    //     setData(res.data.Hello)
    //   });
    // });

    return (
        <Box>
            <Box sx={{ minWidth: 120 }}>
                <Typography paddingBottom={2} variant="h4">  Analytics </Typography>
                <Stack sx={{ p: 4 }}>
                <Typography paddingBottom={2} variant="h7"> Breakdown by Filter Query</Typography>
                <Stack direction="row" justifyContent={"space-between"} spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel>Fund ID</InputLabel>
                        <Select
                            value={fundId}
                            label="Fund ID"
                            onChange={handleFundChange}
                            // multiple
                            MenuProps={MenuProps}
                        >
                            {fundIds.map((e) => <MenuItem value={e}> {e} </MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Type of Filter</InputLabel>
                        <Select
                            value={type}
                            label="Type of Filter"
                            onChange={handleTypeChange}
                        >
                            <MenuItem value={"instruments"}>Instrument</MenuItem>
                            <MenuItem value={"country"}>Country</MenuItem>
                            <MenuItem value={"sector"}>Sector</MenuItem>
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Date"
                            value={startDate}
                            onChange={setStartDate} />
                    </LocalizationProvider>

                    <Button onClick={handleQuery}> Visualise </Button>
                </Stack>
                </Stack>
            </Box>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                {console.log("tag" ,data)}
                { data && <SomeChart filter={type} data={data}/> }
            </Container>
        </Box>
    );
}
