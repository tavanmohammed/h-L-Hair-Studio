{/* SPECIAL HOURS */}

<section className="bg-white rounded-xl shadow p-5">

  <h2 className="font-semibold text-lg mb-2">
    Special Hours, Monday Opening & Closures
  </h2>

  <p className="text-sm text-gray-600 mb-4">
    Monday is closed by default. To open a specific Monday,
    choose the Monday date, select Open / Override hours,
    choose the opening and closing times, then save the rule.
  </p>

  <div className="grid gap-3 md:grid-cols-3">

    <input
      type="date"
      value={ruleDate}
      onChange={(event) =>
        setRuleDate(
          event.target.value
        )
      }
      className="border rounded-lg p-3"
    />

    <select
      value={ruleKind}
      onChange={(event) =>
        setRuleKind(
          event.target.value
        )
      }
      className="border rounded-lg p-3"
    >
      <option value="closed">
        Closed all day
      </option>

      <option value="hours">
        Open / Override hours
      </option>

      <option value="blocks">
        Block time
      </option>
    </select>

    {ruleKind === "hours" && (
      <div className="flex gap-2">

        <input
          type="time"
          value={ruleOpen}
          onChange={(event) =>
            setRuleOpen(
              event.target.value
            )
          }
          className="border rounded-lg p-3 w-full"
        />

        <input
          type="time"
          value={ruleClose}
          onChange={(event) =>
            setRuleClose(
              event.target.value
            )
          }
          className="border rounded-lg p-3 w-full"
        />

      </div>
    )}

  </div>

  {ruleKind === "blocks" && (
    <div className="mt-4 space-y-2">

      {ruleBlocks.map(
        (block, index) => (
          <div
            key={index}
            className="flex gap-2"
          >

            <input
              type="time"
              value={
                block.start
              }
              onChange={(
                event
              ) => {
                const next = [
                  ...ruleBlocks,
                ];

                next[index] = {
                  ...next[index],

                  start:
                    event.target
                      .value,
                };

                setRuleBlocks(
                  next
                );
              }}
              className="border rounded-lg p-3"
            />

            <input
              type="time"
              value={
                block.end
              }
              onChange={(
                event
              ) => {
                const next = [
                  ...ruleBlocks,
                ];

                next[index] = {
                  ...next[index],

                  end:
                    event.target
                      .value,
                };

                setRuleBlocks(
                  next
                );
              }}
              className="border rounded-lg p-3"
            />

          </div>
        )
      )}

      <button
        type="button"
        onClick={() =>
          setRuleBlocks([
            ...ruleBlocks,

            {
              start:
                "13:00",

              end:
                "14:00",
            },
          ])
        }
        className="border px-3 py-2 rounded-lg"
      >
        + Add Block
      </button>

    </div>
  )}

  <div className="mt-4">

    <button
      type="button"
      onClick={addRule}
      className="bg-black text-white px-4 py-2 rounded-lg"
    >
      Save Rule
    </button>

    {ruleMsg && (
      <span className="ml-3 text-sm">
        {ruleMsg}
      </span>
    )}

  </div>

  <div className="mt-6">

    <h3 className="font-medium mb-3">
      This month's rules
    </h3>

    {rules.map(
      (rule) => (
        <div
          key={rule._id}
          className="flex justify-between border-b py-2"
        >

          <div>
            <strong>
              {rule.date}
            </strong>

            {" — "}

            {rule.kind}

            {rule.kind ===
              "hours" &&
              rule.open &&
              rule.close && (
                <>
                  {" "}
                  ({rule.open} -{" "}
                  {rule.close})
                </>
              )}
          </div>

          <button
            type="button"
            onClick={() =>
              removeRule(
                rule._id
              )
            }
            className="text-red-600"
          >
            Delete
          </button>

        </div>
      )
    )}

  </div>

</section>
