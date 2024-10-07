import type { KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import { useForm, Controller } from 'react-hook-form';
import {
  Modal, ModalBody, ModalFooter, ModalHeader,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useRagSearchModal } from '~/stores/rag-search';
import loggerFactory from '~/utils/logger';

import { MessageCard } from './MessageCard';
import { ResizableTextarea } from './ResizableTextArea';

import styles from './AiChatModal.module.scss';

const moduleClass = styles['rag-search-modal'];

const logger = loggerFactory('growi:clinet:components:RagSearchModal');


type Message = {
  id: string,
  content: string,
  isUserMessage?: boolean,
}

type FormData = {
  input: string;
};

const AiChatModalSubstance = (): JSX.Element => {

  const form = useForm<FormData>({
    defaultValues: {
      input: '',
    },
  });

  const [threadId, setThreadId] = useState<string | undefined>();
  const [messageLogs, setMessageLogs] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message>();

  useEffect(() => {
    // do nothing when the modal is closed or threadId is already set
    if (threadId != null) {
      return;
    }

    const createThread = async() => {
      // create thread
      try {
        const res = await apiv3Post('/openai/thread', { threadId });
        const thread = res.data.thread;

        setThreadId(thread.id);
      }
      catch (err) {
        logger.error(err.toString());
      }
    };

    createThread();
  }, [threadId]);

  const submit = useCallback(async(data: FormData) => {
    const { length: logLength } = messageLogs;

    // post message
    try {
      form.clearErrors();

      const response = await fetch('/_api/v3/openai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: data.input, threadId }),
      });

      if (!response.ok) {
        const resJson = await response.json();
        if ('errors' in resJson) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const errors = resJson.errors.map(({ message }) => message).join(', ');
          form.setError('input', { type: 'manual', message: `[${response.status}] ${errors}` });
        }
        return;
      }

      // add user message to the logs
      const newUserMessage = { id: logLength.toString(), content: data.input, isUserMessage: true };
      setMessageLogs(msgs => [...msgs, newUserMessage]);

      // reset form
      form.reset();

      // add assistant message
      const newAssistantMessage = { id: (logLength + 1).toString(), content: '' };
      setLastMessage(newAssistantMessage);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      const read = async() => {
        if (reader == null) return;

        const { done, value } = await reader.read();

        // add assistant message to the logs
        if (done) {
          setLastMessage((lastMessage) => {
            if (lastMessage == null) return;
            setMessageLogs(msgs => [...msgs, lastMessage]);
            return undefined;
          });
          return;
        }

        const chunk = decoder.decode(value);

        // Extract text values from the chunk
        const textValues = chunk
          .split('\n\n')
          .filter(line => line.trim().startsWith('data:'))
          .map((line) => {
            const data = JSON.parse(line.replace('data: ', ''));
            return data.content[0].text.value;
          });

        // append text values to the assistant message
        setLastMessage((prevMessage) => {
          if (prevMessage == null) return;
          return {
            ...prevMessage,
            content: prevMessage.content + textValues.join(''),
          };
        });

        read();
      };
      read();
    }
    catch (err) {
      logger.error(err.toString());
      form.setError('input', { type: 'manual', message: err.toString() });
    }

  }, [form, messageLogs, threadId]);

  const keyDownHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      form.handleSubmit(submit)();
    }
  };

  return (
    <>
      <ModalBody className="vstack gap-4 pb-0 pt-3 pt-lg-4 px-3 px-lg-4">
        <div className="pb-4">
          { messageLogs.map(message => (
            <MessageCard key={message.id} right={message.isUserMessage}>{message.content}</MessageCard>
          )) }
          { lastMessage != null && (
            <>
              <MessageCard>{lastMessage.content}</MessageCard>
              <div className="d-flex justify-content-center">
                <span className="bg-secondary-subtle text-body-secondary rounded-pill px-3 py-1">
                  情報が正しいか出典を確認しましょう
                </span>
              </div>
            </>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="pt-0 pb-3 pb-lg-4 px-3 px-lg-4">
        <form onSubmit={form.handleSubmit(submit)} className="flex-fill hstack gap-2 align-items-end m-0">
          <Controller
            name="input"
            control={form.control}
            render={({ field }) => (
              <ResizableTextarea
                {...field}
                required
                className="form-control textarea-ask"
                style={{ resize: 'none' }}
                rows={1}
                placeholder="ききたいことを入力してください"
                onKeyDown={keyDownHandler}
              />
            )}
          />
          <button
            type="submit"
            className="btn btn-submit no-border"
            disabled={form.formState.isSubmitting}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>

        {form.formState.errors.input != null && (
          <span className="text-danger small">{form.formState.errors.input?.message}</span>
        )}
      </ModalFooter>
    </>
  );
};


export const AiChatModal = (): JSX.Element => {

  const { data: ragSearchModalData, close: closeRagSearchModal } = useRagSearchModal();

  const isOpened = ragSearchModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeRagSearchModal} className={moduleClass} scrollable>

      <ModalHeader tag="h4" toggle={closeRagSearchModal} className="pe-4">
        <span className="material-symbols-outlined text-primary">psychology</span>
        GROWI Assistant
      </ModalHeader>

      { isOpened && (
        <AiChatModalSubstance />
      ) }

    </Modal>
  );
};
