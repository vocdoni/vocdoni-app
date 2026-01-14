import { TFunction } from 'i18next'

export const translations = (t: TFunction<string, string>) => ({
  actions: {
    cancel_description: t('cc.actions.cancel_description').toString(),
    cancel: t('cc.actions.cancel').toString(),
    continue_description: t('cc.actions.continue_description').toString(),
    continue: t('cc.actions.continue').toString(),
    end_description: t('cc.actions.end_description').toString(),
    end: t('cc.actions.end').toString(),
    error_title: t('cc.actions.error_title').toString(),
    pause_description: t('cc.actions.pause_description').toString(),
    pause: t('cc.actions.pause').toString(),
    waiting_title: t('cc.actions.waiting_title').toString(),
  },
  confirm: {
    end_process_title: t('cc.confirm.end_process_title').toString(),
    end_process_button: t('cc.confirm.end_process_button').toString(),
    cancel_process_title: t('cc.confirm.cancel_process_title').toString(),
    cancel_process_button: t('cc.confirm.cancel_process_button').toString(),
    title: t('cc.confirm.title').toString(),
    cancel: t('cc.confirm.cancel').toString(),
    confirm: t('cc.confirm.confirm').toString(),
    cancel_button: t('cc.confirm.cancel_button').toString(),
  },
  // questions and vote button
  vote: {
    abstain: t('cc.vote.abstain').toString(),
    button_update: t('cc.vote.button_update').toString(),
    button: t('cc.vote.button').toString(),
    confirm: t('cc.vote.confirm').toString(),
    sign: t('cc.vote.sign').toString(),
    voted_description: t('cc.vote.voted_description').toString(),
    voted_title: t('cc.vote.voted_title').toString(),
    weight: t('cc.vote.weight').toString(),
  },
  empty: t('cc.empty').toString(),
  errors: {
    wrong_data_title: t('cc.errors.wrong_data_title').toString(),
    wrong_data_description: t('cc.errors.wrong_data_description').toString(),
  },
  loading: t('cc.loading', { defaultValue: 'Loading...' }).toString(),
  pagination: {
    total_results: t('cc.pagination.total_results', {
      defaultValue: 'Showing a total of {{ count }} results',
    }).toString(),
  },
  question_types: {
    approval_tooltip: t('cc.question_types.approval_tooltip', {
      defaultValue:
        "Approval voting lets you vote for as many options as you like. The one with the most votes wins. It's a simple way to show your support for all the choices you approve of.",
    }).toString(),
    approval_title: t('cc.question_types.approval_title', {
      defaultValue: 'Approval Voting',
    }).toString(),
    singlechoice_title: t('cc.question_types.singlechoice_title', {
      defaultValue: 'Single Choice {{ weighted }}',
    }).toString(),
    multichoice_tooltip: t('cc.question_types.multichoice_tooltip', {
      defaultValue:
        'Multichoice voting lets you vote for up to {{maxcount}} options (defined by the voting organizer). The one with the most votes wins.',
    }).toString(),
    multichoice_title: t('cc.question_types.multichoice_title', {
      defaultValue: 'Multichoice Voting {{ weighted }}',
    }).toString(),
    multichoice_desc: t('cc.question_types.multichoice_desc', {
      defaultValue: 'Select up to {{maxcount}} options',
    }).toString(),
    multichoice_desc_abstain: t('cc.question_types.multichoice_desc_abstain', {
      defaultValue: ' (or abstain)',
    }).toString(),
    multichoice_cannot_abstain: t('cc.question_types.multichoice_cannot_abstain', {
      defaultValue: 'Too many options selected',
    }).toString(),
    weighted_voting: t('cc.question_types.weighted_voting', {
      defaultValue: 'Weighted Voting',
    }).toString(),
  },
  // results component
  results: {
    date_format: t('cc.results.date_format').toString(),
    secret_until_the_end: t('cc.results.secret_until_the_end').toString(),
    title: t('cc.results.title').toString(),
    votes: t('cc.results.votes').toString(),
  },
  schedule: {
    from_begin_to_end: t('cc.schedule.from_begin_to_end', {
      defaultValue: 'Voting from {{ begin }} to {{ end }}',
    }).toString(),
    ended: t('cc.schedule.ended', { defaultValue: 'Ended {{ distance }}' }).toString(),
    paused_start: t('cc.schedule.paused_start', { defaultValue: '(Paused) Starts {{ distance }}' }).toString(),
    paused_end: t('cc.schedule.paused_end', { defaultValue: '(Paused) Ends {{ distance }}' }).toString(),
    created: t('cc.schedule.created', { defaultValue: 'Created {{ distance }}' }).toString(),
  },
  spreadsheet: {
    access_button: t('cc.spreadsheet.access_button').toString(),
    anon_sik_label: t('cc.spreadsheet.anon_sik_label').toString(),
    anon_sik_helper: t('cc.spreadsheet.anon_sik_helper').toString(),
    close: t('cc.spreadsheet.close').toString(),
    logout: t('logout').toString(),
    modal_title: t('cc.spreadsheet.modal_title').toString(),
  },
  // status badge
  statuses: {
    canceled: t('cc.statuses.canceled').toString(),
    ended: t('cc.statuses.ended').toString(),
    invalid: t('cc.statuses.invalid').toString(),
    ongoing: t('cc.statuses.ongoing').toString(),
    paused: t('cc.statuses.paused').toString(),
    results: t('cc.statuses.results').toString(),
    upcoming: t('cc.statuses.upcoming').toString(),
    process_unknown: t('cc.statuses.process_unknown').toString(),
  },
  validation: {
    choices_count: t('cc.validation.choices_count').toString(),
    required: t('cc.validation.required').toString(),
    min_length: t('cc.validation.min_length').toString(),
  },
})
