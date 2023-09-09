import { useState, useEffect } from 'react';
// @mui
import { Box, Grid, Container, Typography, Stack, TextField, Button } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select, { SelectChangeEvent } from '@mui/material/Select';



import axios from 'axios'
// hooks
import useSettings from '../../../../hooks/useSettings';
// sections
import {
    AnalyticsTasks,
    AnalyticsNewsUpdate,
    AnalyticsOrderTimeline,
    AnalyticsCurrentVisits,
    AnalyticsWebsiteVisits,
    AnalyticsTrafficBySite,
    AnalyticsWidgetSummary,
    AnalyticsCurrentSubject,
    AnalyticsConversionRates,
} from '.';


// ---------------------------------------------------------------------


export default function Query5() {
    const { themeStretch } = useSettings();
    const [nvalues, setNvalues] = useState(null);

    const handleNvaluesChange = (e) => {
        setNvalues(e.target.value)
    }



    const handleQuery = () => {
        console.log({
            "nValues": nvalues
        })
    }

    // useEffect(() => {
    //   axios.get("http://ec2-54-169-209-187.ap-southeast-1.compute.amazonaws.com/routers").then(res => {
    //     setData(res.data.Hello)
    //   });
    // });

    return (
        <Box>
            <Box sx={{ minWidth: 120 }}>
                <Stack direction="row" justifyContent={"space-between"} spacing={2} sx={{ p: 4 }}>



                    <TextField
                        id="outlined-required"
                        label="Top N Funds"
                        value={nvalues}
                        onChange={handleNvaluesChange}
                    />



                    <Button onClick={handleQuery}> Visualise </Button>
                </Stack>
            </Box>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                {nvalues && <AnalyticsConversionRates />}
            </Container>
        </Box>
    );
}
