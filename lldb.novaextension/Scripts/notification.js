exports = {
  /**
   * @param title {string}
   * @param body {string}
   * @param actions {string[] | undefined}
   */
  send(title, body, actions) {
    const request = new NotificationRequest();
    request.title = title;
    request.body = body;
    request.actions = actions && actions.length ? actions.map(action => action.label) : [];
    return nova.notifications.add(request).then(response => ({
      ...response,
      action: response.actionIdx && actions && actions.length ? actions[response.actionIdx] : null,
    }));
  },
};
