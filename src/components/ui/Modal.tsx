import Button from "./Button";
import classNames from "classnames";
import { Children } from "../../types/Preact";
import { createPortal, useEffect } from "preact/compat";
import styled, { keyframes } from "styled-components";

const open = keyframes`
    0% {opacity: 0;}
    70% {opacity: 0;}
    100% {opacity: 1;}
`;

const zoomIn = keyframes`
    0% {transform: scale(0.5);}
    98% {transform: scale(1.01);}
    100% {transform: scale(1);}
`;

const ModalBase = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    position: fixed;
    max-height: 100%;
    user-select: none;

    animation-name: ${open};
    animation-duration: 0.2s;

    display: grid;
    overflow-y: auto;
    place-items: center;

    color: var(--foreground);
    background: rgba(0, 0, 0, 0.8);
`;

const ModalContainer = styled.div`
    overflow: hidden;
    border-radius: 8px;
    max-width: calc(100vw - 20px);

    animation-name: ${zoomIn};
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(.3,.3,.18,1.1);
`;

const ModalContent = styled.div<{ [key in 'attachment' | 'noBackground' | 'border']?: boolean }>`
`;

const ModalActions = styled.div`
    gap: 8px;
    display: flex;
    flex-direction: row-reverse;

    padding: 1em 1.5em;
    border-radius: 0 0 8px 8px;
    background: var(--secondary-background);
`;

export interface Action {
    text: Children;
    onClick: () => void;
    confirmation?: boolean;
    style?: 'default' | 'contrast' | 'error' | 'contrast-error';
}

interface Props {
    children?: Children;
    title?: Children;

    disallowClosing?: boolean;
    noBackground?: boolean;
    dontModal?: boolean;

    onClose: () => void;
    actions?: Action[];
    disabled?: boolean;
    border?: boolean;
    visible: boolean;
}

export default function Modal(props: Props) {
    if (!props.visible) return null;

    let content = (
        <ModalContent
            attachment={!!props.actions}
            noBackground={props.noBackground}
            border={props.border}>
            {props.title && <h3>{props.title}</h3>}
            {props.children}
        </ModalContent>
    );

    if (props.dontModal) {
        return content;
    }

    let confirmationAction = props.actions?.find(action => action.confirmation);
    useEffect(() => {
        if (!confirmationAction) return;

        // ! FIXME: this may be done better if we
        // ! can focus the button although that
        // ! doesn't seem to work...
        function keyDown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                confirmationAction!.onClick();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, [ confirmationAction ]);

    return createPortal(
        <ModalBase onClick={(!props.disallowClosing && props.onClose) || undefined}>
            <ModalContainer onClick={e => (e.cancelBubble = true)}>
                {content}
                {props.actions && (
                    <ModalActions>
                        {props.actions.map(x => (
                            <Button style={x.style ?? "contrast"}
                                onClick={x.onClick}
                                disabled={props.disabled}>
                                {x.text}
                            </Button>
                        ))}
                    </ModalActions>
                )}
            </ModalContainer>
        </ModalBase>,
        document.body
    );
}