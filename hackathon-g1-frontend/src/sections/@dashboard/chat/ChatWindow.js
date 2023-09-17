import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// @mui
import { Box, Divider, Stack } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import Scrollbar from '../../../components/Scrollbar';
import {
  addRecipients,
  onSendMessage,
  getConversation,
  getParticipants,
  markConversationAsRead,
  resetActiveConversation,
} from '../../../redux/slices/chat';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import ChatRoom from './ChatRoom';
import ChatMessageList from './ChatMessageList';
import ChatHeaderDetail from './ChatHeaderDetail';
import ChatMessageInput from './ChatMessageInput';
import ChatHeaderCompose from './ChatHeaderCompose';

// ----------------------------------------------------------------------

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

export default function ChatWindow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const conversationKey = "reece.chung";
  const { contacts, recipients, participants, activeConversationId } = useSelector((state) => state.chat);
  const conversation = useSelector((state) => conversationSelector(state));
  const scrollRef = useRef(null);

  const mode = conversationKey ? 'DETAIL' : 'COMPOSE';
  const displayParticipants = participants.filter((item) => item.id !== '8864c717-587d-472a-929a-8e5f298024da-0');

  useEffect(() => {
    console.log(conversationKey)
    const getDetails = async () => {
      dispatch(getParticipants(conversationKey));
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

  useEffect(() => {
    if (activeConversationId) {
      dispatch(markConversationAsRead(activeConversationId));
    }
  }, [dispatch, activeConversationId]);

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

  return (
    <Stack sx={{ flexGrow: 1, minWidth: '1px' }}>
      {/* {mode === 'DETAIL' ? (
        <ChatHeaderDetail participants={displayParticipants} />
      ) : (
        <ChatHeaderCompose
          recipients={recipients}
          contacts={Object.values(contacts.byId)}
          onAddRecipients={handleAddRecipients}
        />
      )} */}

      <Divider />

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Stack sx={{ flexGrow: 1 }}>

        <Scrollbar scrollableNodeProps={{ ref: scrollRef }} sx={{ p: 3, height: 1 }}>
          <ChatMessageList conversation={conversation} />
        </Scrollbar>
        </Stack>
      </Box>

      <Divider />

          <ChatMessageInput
            conversationId={activeConversationId}
            onSend={handleSendMessage}
            disabled={pathname === PATH_DASHBOARD.chat.new}
          />
    </Stack>
  );
}
