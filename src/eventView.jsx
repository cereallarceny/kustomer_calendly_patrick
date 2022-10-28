const data = this;

<div>
  {data.kobject.custom ? (
    <Segment>
      <Grid>
        <Column size="eight">
          <h4>Invitation Information</h4>
          <Field
            field="eventTypeStr"
            key="eventTypeStr"
            type="kobject.calendly-event"
            value={object.custom.eventTypeStr}
          />
          <Field
            field="eventNameStr"
            key="eventNameStr"
            type="kobject.calendly-event"
            value={object.custom.eventNameStr}
          />
          <Field
            field="eventDescriptionStr"
            key="eventDescriptionStr"
            type="kobject.calendly-event"
            value={object.custom.eventDescriptionStr}
          />
          <BasicField
            label="Event Duration"
            value={`${data.kobject.custom.eventDurationNum.toString()} minutes`}
          />
          <Field
            field="startTimeAt"
            key="startTimeAt"
            type="kobject.calendly-event"
            value={object.custom.startTimeAt}
          />
          <Field
            field="endTimeAt"
            key="endTimeAt"
            type="kobject.calendly-event"
            value={object.custom.endTimeAt}
          />
        </Column>
        <Column size="eight">
          <h4>Cancelation Details</h4>
          <Field
            field="canceledStr"
            key="canceledStr"
            type="kobject.calendly-event"
            value={object.custom.canceledStr}
          />
          <Field
            field="cancelReasonStr"
            key="cancelReasonStr"
            type="kobject.calendly-event"
            value={object.custom.cancelReasonStr}
          />
          <Field
            field="canceledDateStr"
            key="canceledDateStr"
            type="kobject.calendly-event"
            value={object.custom.canceledDateStr}
          />
        </Column>
      </Grid>
      <Grid>
        <Column size="sixteen">
          <h4>Questions / Answers</h4>
          {data.kobject.data.payload.questions_and_answers.map((lineItem) => (
            <Grid>
              <Column size="sixteen">
                <BasicField label="Question" value={lineItem.question} />
                <BasicField label="Answer" value={lineItem.answer} />
              </Column>
            </Grid>
          ))}
        </Column>
      </Grid>
    </Segment>
  ) : null}
</div>;
