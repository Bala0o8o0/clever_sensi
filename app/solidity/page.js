// ------|||||Solidity _Bot|||||------
// ------|||||Solidity _Bot|||||------
"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import ChatForm from "../components/ChatForm.js";
import Message from "../components/Message.js";
import SlideOver from "../components/SlideOver.js";
import EmptyState from "../components/EmptyState.js";
import QueuedSpinner from "../components/QueuedSpinner.js";
import {
  Cog6ToothIcon,
  CodeBracketIcon,
  CpuChipIcon,
} from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";
import { Toaster, toast } from "react-hot-toast";
import { LlamaTemplate } from "../../src/prompt_template.js";
import { countTokens } from "../src/tokenizer.js";

const MODELS = [
  {
    id: "meta/llama-2-7b-chat",
    name: "Llama 2 7B",
    shortened: "7B",
  },
  {
    id: "meta/llama-2-13b-chat",
    name: "Llama 2 13B",
    shortened: "13B",
  },
  {
    id: "meta/llama-2-70b-chat",
    name: "Llama 2 70B",
    shortened: "70B",
  },
  {
    id: "yorickvp/llava-13b",
    name: "Llava 13B",
    shortened: "Llava",
  },
  {
    id: "nateraw/salmonn",
    name: "Salmonn",
    shortened: "Salmonn",
  },
];

const llamaTemplate = LlamaTemplate();

const generatePrompt = (template, systemPrompt, messages) => {
  const chat = messages.map((message) => ({
    role: message.isUser ? "user" : "assistant",
    content: message.text,
  }));

  return template([
    {
      role: "system",
      content: systemPrompt,
    },
    ...chat,
  ]);
};

function CTA({ shortenedModelName }) {
  if (shortenedModelName == "Llava") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Llava in the cloud.
      </a>
    );
  } else if (shortenedModelName == "Salmonn") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Salmonn in the cloud.
      </a>
    );
  } else {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Llama 2 in the cloud.
      </a>
    );
  }
}

const metricsReducer = (state, action) => {
  switch (action.type) {
    case "START":
      return { startedAt: new Date() };
    case "FIRST_MESSAGE":
      return { ...state, firstMessageAt: new Date() };
    case "COMPLETE":
      return { ...state, completedAt: new Date() };
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
};

export default function HomePage() {
  const MAX_TOKENS = 4096;
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  //   Llama params
  const [model, setModel] = useState(MODELS[2]); // default to 70B
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [temp, setTemp] = useState(0.75);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(800);

  //  Llava params
  const [image, setImage] = useState(null);

  // Salmonn params
  const [audio, setAudio] = useState(null);

  const [metrics, dispatch] = useReducer(metricsReducer, {
    startedAt: null,
    firstMessageAt: null,
    completedAt: null,
  });

  const { complete, completion, setInput, input } = useCompletion({
    api: "/api",
    body: {
      model: model.id,
      systemPrompt: systemPrompt,
      temperature: parseFloat(temp),
      topP: parseFloat(topP),
      maxTokens: parseInt(maxTokens),
      image: image,
      audio: audio,
    },

    onError: (error) => {
      setError(error);
    },
    onResponse: (response) => {
      setStarting(false);
      setError(null);
      dispatch({ type: "FIRST_MESSAGE" });
    },
    onFinish: () => {
      dispatch({ type: "COMPLETE" });
    },
  });

  const handleFileUpload = (file) => {
    if (file) {
      // determine if file is image or audio
      if (
        ["audio/mpeg", "audio/wav", "audio/ogg"].includes(
          file.originalFile.mime
        )
      ) {
        setAudio(file.fileUrl);
        setModel(MODELS[4]);
        toast.success(
          "You uploaded an audio file, so you're now speaking with Salmonn."
        );
      } else if (["image/jpeg", "image/png"].includes(file.originalFile.mime)) {
        setImage(file.fileUrl);
        setModel(MODELS[3]);
        toast.success(
          "You uploaded an image, so you're now speaking with Llava."
        );
      } else {
        toast.error(
          `Sorry, we don't support that file type (${file.originalFile.mime}) yet. Feel free to push a PR to add support for it!`
        );
      }
    }
  };

  const setAndSubmitPrompt = (newPrompt) => {
    handleSubmit(newPrompt);
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setOpen(false);
    setSystemPrompt(event.target.systemPrompt.value);
  };

  const handleSubmit = async (userMessage) => {
    setStarting(true);
    const SNIP = "<!-- snip -->";

    const messageHistory = [...messages];
    if (completion.length > 0) {
      messageHistory.push({
        text: completion,
        isUser: false,
      });
    }
    messageHistory.push({
      text: userMessage,
      isUser: true,
    });

    // Generate initial prompt and calculate tokens
    let prompt = `${generatePrompt(
      llamaTemplate,
      systemPrompt,
      messageHistory
    )}\n`;
    // Check if we exceed max tokens and truncate the message history if so.
    while (countTokens(prompt) > MAX_TOKENS) {
      if (messageHistory.length < 3) {
        setError(
          "Your message is too long. Please try again with a shorter message."
        );

        return;
      }

      // Remove the third message from history, keeping the original exchange.
      messageHistory.splice(1, 2);

      // Recreate the prompt
      prompt = `${SNIP}\n${generatePrompt(
        llamaTemplate,
        systemPrompt,
        messageHistory
      )}\n`;
    }

    setMessages(messageHistory);

    dispatch({ type: "START" });

    complete(prompt);
  };

  useEffect(() => {
    if (messages?.length > 0 || completion?.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, completion]);

  return (
    <>
      {/* <div className="bg-slate-100 border-b-2 text-center p-3">
        Powered by Replicate. <CTA shortenedModelName={model.shortened} />
      </div> */}
      <div className="bg2 w-screen overflow-auto max-h-screen">
        <nav className="flex justify-end pt-3 pl-6 pr-3 sm:grid-cols-3 sm:pl-0">
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 text-sm font-semibold
           text-[#6afafa] hover:text-black bg-white backdrop-blur-lg bg-opacity-20 rounded-md shadow-sm ring-1 ring-inset
             hover:bg-[#6afafa]"
              onClick={() => setOpen(true)}
            >
              <CpuChipIcon
                color="green"
                className="w-5 h-5  text-[#6afafa] sm:mr-2  hover:text-black "
                aria-hidden="true"
              />{" "}
              <span className="hidden sm:inline">Mode</span>
            </button>
          </div>
        </nav>

        <div className="hidden sm:inline-block"></div>
        <div
          className="font-semibold bg-black p-2 border-[1px] rounded-e-xl 
      border-[#6afafa] max-w-32 text-xs h-15 animate-pulse 
      text-[#6afafa] sm:text-center"
        >
          {model.shortened == "Llava"
            ? "🌋"
            : model.shortened == "Salmonn"
            ? "🐟"
            : "🦙"}{" "}
          <span className="hidden sm:inline-block">Talk To</span>{" "}
          <button
            className=" font-semibold text-white hover:underline"
            onClick={() => setOpen(true)}
          >
            {model.shortened == "Llava" || model.shortened == "Salmonn"
              ? model.shortened
              : "Goliath " + model.shortened}
          </button>
        </div>

        <Toaster position="top-left" reverseOrder={false} />

        <main className="max-w-3xl pb-2 mx-auto sm:-mt-16 sm:px-4">
          <div className="text-center"></div>
          {messages.length == 0 && !image && !audio && (
            <EmptyState setPrompt={setAndSubmitPrompt} setOpen={setOpen} />
          )}

          <SlideOver
            open={open}
            setOpen={setOpen}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            handleSubmit={handleSettingsSubmit}
            temp={temp}
            setTemp={setTemp}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            topP={topP}
            setTopP={setTopP}
            models={MODELS}
            size={model}
            setSize={setModel}
          />

          {image && (
            <div>
              <img src={image} className="mt-6 sm:rounded-xl" />
            </div>
          )}

          {audio && (
            <div>
              <audio controls src={audio} className="mt-6 sm:rounded-xl" />
            </div>
          )}

          <ChatForm
            prompt={input}
            setPrompt={setInput}
            onSubmit={handleSubmit}
            handleFileUpload={handleFileUpload}
            completion={completion}
            metrics={metrics}
          />

          {error && <div>{error}</div>}

          <article className="pb-24">
            {messages.map((message, index) => (
              <Message
                key={`message-${index}`}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            <Message message={completion} isUser={false} />

            {starting && <QueuedSpinner />}

            <div ref={bottomRef} />
          </article>
        </main>
      </div>
    </>
  );
}
