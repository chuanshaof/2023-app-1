import PropTypes from 'prop-types';
import { AnimatePresence, m } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useState, useEffect, useRef } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Backdrop, Divider, Typography, Stack, FormControlLabel, Radio } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// utils
import cssStyles from '../../utils/cssStyles';
// config
import { NAVBAR, defaultSettings } from '../../config';
//
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';
import { IconButtonAnimate, varFade } from '../animate';
//
import ToggleButton from './ToggleButton';

// import ChatWindow from '../../sections/@dashboard/chat/ChatWindow'

import { useDispatch, useSelector } from '../../redux/store';
import {
  addRecipients,
  onSendMessage,
  getConversation,
  getParticipants,
  markConversationAsRead,
  resetActiveConversation,
} from '../../redux/slices/chat';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
//
import ChatMessageList from '../../sections/@dashboard/chat/ChatMessageList';
import ChatMessageInput from '../../sections/@dashboard/chat/ChatMessageInput';


// ----------------------------------------------------------------------

const RootStyle = styled(m.div)(({ theme }) => ({
  ...cssStyles(theme).bgBlur({ color: theme.palette.background.paper, opacity: 0.92 }),
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  position: 'fixed',
  overflow: 'hidden',
  width: NAVBAR.BASE_WIDTH,
  height: NAVBAR.BASE_HEIGHT,
  flexDirection: 'column',
  margin: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  zIndex: theme.zIndex.drawer + 3,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  boxShadow: `-24px 12px 32px -4px ${alpha(
    theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
    0.16
  )}`,
}));

const conversationSelector = (state) => {
  const { conversations, activeConversationId } = state.chat;
  const conversation = activeConversationId ? conversations.byId[activeConversationId] : null;
 
  if (conversation) {
    return conversation;
  }
  const initState = {
    id: '',
    messages: [],
    participants: [],
    unreadCount: 0,
    type: '',
  };
  return initState;
};

// ----------------------------------------------------------------------

export default function Settings() {
  const { themeMode, themeDirection, themeColorPresets, themeStretch, themeLayout, onResetSetting } = useSettings();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const conversationKey = "reece.chung";
  const { activeConversationId } = useSelector((state) => state.chat);
  const conversation = useSelector((state) => conversationSelector(state));
  const scrollRef = useRef(null);

  const mode = conversationKey ? 'DETAIL' : 'COMPOSE';

  useEffect(() => {
    const getDetails = async () => {
      // dispatch(getParticipants(conversationKey));
      try {
        await dispatch(getConversation(conversationKey));
      } catch (error) {
        console.error(error);
        navigate(PATH_DASHBOARD.chat.new);
      }
    };
    if (conversationKey) {
      getDetails();
    } else if (activeConversationId) {
      dispatch(resetActiveConversation());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationKey]);

  // useEffect(() => {
  //   if (activeConversationId) {
  //     dispatch(markConversationAsRead(activeConversationId));
  //   }
  // }, [dispatch, activeConversationId]);

  const handleAddRecipients = (recipients) => {
    dispatch(addRecipients(recipients));
  };

  const handleSendMessage = async (value) => {
    try {
      dispatch(onSendMessage(value));
    } catch (error) {
      console.error(error);
    }
  };


  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeDirection !== defaultSettings.themeDirection ||
    themeColorPresets !== defaultSettings.themeColorPresets ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch;

  const varSidebar =
    themeDirection !== 'rtl'
      ? varFade({
          distance: NAVBAR.BASE_WIDTH,
          durationIn: 0.32,
          durationOut: 0.32,
        }).inRight
      : varFade({
          distance: NAVBAR.BASE_WIDTH,
          durationIn: 0.32,
          durationOut: 0.32,
        }).inLeft;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{ background: 'transparent', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      />

      {!open && <ToggleButton open={open} notDefault={notDefault} onToggle={handleToggle} />}

      <AnimatePresence>
        {open && (
          <>
            <RootStyle {...varSidebar}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
                <Typography variant="subtitle1">Ask Jamie</Typography>
                <div>
                  <IconButtonAnimate onClick={onResetSetting}>
                    <Iconify icon={'ic:round-refresh'} width={20} height={20} />
                  </IconButtonAnimate>
                  <IconButtonAnimate onClick={handleClose}>
                    <Iconify icon={'eva:close-fill'} width={20} height={20} />
                  </IconButtonAnimate>
                </div>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed' }} />
              {/* <Scrollbar sx={{ flexGrow: 1 }}> */}
                
                {/* <Stack spacing={3} sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Mode</Typography>
                    <SettingMode />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Direction</Typography>
                    <SettingDirection />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Layout</Typography>
                    <SettingLayout />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Presets</Typography>
                    <SettingColorPresets />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Stretch</Typography>
                    <SettingStretch />
                  </Stack>

                  <SettingFullscreen />
                </Stack> */}
              {/* </Scrollbar> */}
            <Scrollbar scrollableNodeProps={{ ref: scrollRef }} sx={{ p: 3, height: 1 }}>
            <ChatMessageList conversation={conversation} />
            </Scrollbar>
            <Divider />

            <ChatMessageInput
              conversationId={activeConversationId}
              onSend={handleSendMessage}
              disabled={pathname === PATH_DASHBOARD.chat.new}
            />
            </RootStyle>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ----------------------------------------------------------------------

BoxMask.propTypes = {
  value: PropTypes.string,
};

export function BoxMask({ value }) {
  return (
    <FormControlLabel
      label=""
      value={value}
      control={<Radio sx={{ display: 'none' }} />}
      sx={{
        m: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        position: 'absolute',
      }}
    />
  );
}
