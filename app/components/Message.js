const Message = ({ message, isUser }) => {
  let containerClass = "bg-gray-50";
  if (isUser) {
    containerClass = "";
  }

  if (Array.isArray(message)) {
    message = message.join("");
  }

  if (!message || message === "") {
    return null;
  }

  return (
    <div
      className={`flex gap-x-4 bg-black bg-opacity-10 backdrop-blur-3xl border-[0.5px] border-[#45a7a7] 
      rounded-md ${containerClass} text-[#5dd9da] py-5 px-5 mb-12`}
    >
      {isUser ? (
        <span className="text-xl sm:text-2xl" title="user">
          🥸
        </span>
      ) : (
        <span className="text-xl bg-black bg-opacity-10  sm:text-2xl" title="AI">
          🙀
        </span>
      )}

      <div className="flex flex-col  text-sm sm:text-base flex-1 gap-y-4 mt-1">
        {message.split("\n").map(
          (text, index) =>
            text.length > 0 && (
              <span key={index} className="min-w-0">
                {text}
              </span>
            )
        )}
      </div>
    </div>
  );
};

export default Message;
