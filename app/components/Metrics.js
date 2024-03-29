import { countTokens } from "../src/tokenizer";

export default function Metrics({
  startedAt,
  firstMessageAt,
  completedAt,
  completion,
}) {
  const timeToFirstToken =
    firstMessageAt && startedAt
      ? (new Date(firstMessageAt) - new Date(startedAt)) / 1000.0
      : null;
  const tokenCount = completion && countTokens(completion);
  const runningDuration = firstMessageAt
    ? ((completedAt ? new Date(completedAt) : new Date()) -
        new Date(firstMessageAt)) /
      1000.0
    : null;
  const tokensPerSecond =
    tokenCount > 0 && runningDuration > 0 && tokenCount / runningDuration;

  return (
    <dl className="flex  justify-center  flex-row gap-12">
      {/* <div className="col-span-3 sm:col-span-4 flex items-center justify-center py-4 sm:text-sm text-xs">
        <dd className="text-[#00c3b2] pr-3">
          {timeToFirstToken ? timeToFirstToken.toFixed(2) : "—"}
        </dd>
        <dt className="font-medium text-gray-500">
          <span className="hidden sm:inline">sec to </span> first token
        </dt>
      </div> */}
      <div className="col-span-3 flex items-center justify-center py-4 sm:text-sm text-xs">
        <dd className="text-[#00c3b2] pr-2">
          {tokensPerSecond ? tokensPerSecond.toFixed(2) : "—"}
        </dd>
        <dt className="font-medium text-gray-500">
          t<span className="hidden sm:inline">okens</span> / s
          <span className="hidden sm:inline">ec</span>
        </dt>
      </div>


      <div className="col-span-3 sm:col-span-2 flex items-center justify-center py-4 sm:text-sm text-xs">
        <dd className="text-[#00c3b2] pr-2">{tokenCount || "—"}</dd>
        <dt className="font-medium text-gray-500">tokens</dt>
      </div>


      {/* <div className="col-span-3 flex items-center justify-center py-4 sm:text-sm text-xs">
        <dd className="text-[#00c3b2] pr-2">
          {Math.max(runningDuration, 0).toFixed(2)}
        </dd>
        <dt className="font-medium text-gray-500">run time</dt>
      </div> */}


    </dl>
  );
}
