import { useState, useEffect } from 'react';
// @mui
import { Box, Grid, Container, Typography, Stack, TextField, Button, InputLabel, FormControl, MenuItem } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select, { SelectChangeEvent } from '@mui/material/Select';



import axios from 'axios'
// hooks
import useSettings from '../../../../hooks/useSettings';

import LineChart from './LineChart';


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


export default function Query4() {
    const { themeStretch } = useSettings();
    const [data, setData] = useState(null);
    const [instrumentId, setInstrumentId] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [instrumentList, setInstrumentList] = useState([]);

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

    const handleInstrumentChange = (e) => {
        setInstrumentId(e.target.value)
    }

    const handleQuery = async () => {
        const query = {
            "instrument_id": instrumentId,
            "start_date": startDate.toISOString().split("T")[0],
            "end_date" : endDate.toISOString().split("T")[0],
        }
        sessionStorage.setItem("query4", query);
        await axios.post(`${process?.env.REACT_APP_BACKEND_URL}/analytics/monthly_instrument_return`, query).then(
            res => {
                setData(res.data)}

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
                <Stack sx={{ p: 4 }}>
                <Typography paddingBottom={2} variant="h7"> Monthly Investment Return [ Instrument ] Query</Typography>
                <Stack direction="row" justifyContent={"space-between"} spacing={2} >
                <FormControl fullWidth>
                        <InputLabel>Instrument ID</InputLabel>
                        <Select
                            value={instrumentId}
                            label="instruments"
                            onChange={handleInstrumentChange}
                            MenuProps={MenuProps}
                        >
                            {instrumentList.map((e) => <MenuItem value={e.id}> {e.id} </MenuItem>)}
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Start Date"
                            value={startDate}
                            onChange={setStartDate} />
                        <DatePicker label="End Date"
                            value={endDate}
                            onChange={setEndDate} />
                    </LocalizationProvider>

                    <Button onClick={handleQuery}> Visualise </Button>
                </Stack>
                </Stack>
            </Box>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Stack spacing={2}>
                { data && <LineChart data={data} title={"Monthly Investment of an Instrument"}/> }
                </Stack>
            </Container>
        </Box>
    );
}
