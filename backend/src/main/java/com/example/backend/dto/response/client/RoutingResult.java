package com.example.backend.dto.response.client;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoutingResult {

    private String context;
    private List<ActionItem> actions;
    private Object attachment;

    public RoutingResult() {}

    public RoutingResult(String context, List<ActionItem> actions) {
        this.context = context;
        this.actions = actions;
    }

    public RoutingResult(String context, List<ActionItem> actions, Object attachment) {
        this.context = context;
        this.actions = actions;
        this.attachment = attachment;
    }

}