/*
 * Copyright 2020 The Yorkie Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@yorkie-js-sdk/src/util/logger';
import { TimeTicket } from '@yorkie-js-sdk/src/document/time/ticket';
import { JSONRoot } from '@yorkie-js-sdk/src/document/json/root';
import { RGATreeSplitNodePos } from '@yorkie-js-sdk/src/document/json/rga_tree_split';
import { PlainText } from '@yorkie-js-sdk/src/document/json/plain_text';
import { RichText } from '@yorkie-js-sdk/src/document/json/rich_text';
import { Operation } from '@yorkie-js-sdk/src/document/operation/operation';

/**
 *  `SelectOperation` represents an operation that selects an area in the text.
 */
export class SelectOperation extends Operation {
  private fromPos: RGATreeSplitNodePos;
  private toPos: RGATreeSplitNodePos;

  constructor(
    parentCreatedAt: TimeTicket,
    fromPos: RGATreeSplitNodePos,
    toPos: RGATreeSplitNodePos,
    executedAt: TimeTicket,
  ) {
    super(parentCreatedAt, executedAt);
    this.fromPos = fromPos;
    this.toPos = toPos;
  }

  /**
   * `create` creates a new instance of SelectOperation.
   */
  public static create(
    parentCreatedAt: TimeTicket,
    fromPos: RGATreeSplitNodePos,
    toPos: RGATreeSplitNodePos,
    executedAt: TimeTicket,
  ): SelectOperation {
    return new SelectOperation(parentCreatedAt, fromPos, toPos, executedAt);
  }

  /**
   * `execute` executes this operation on the given document(`root`).
   */
  public execute(root: JSONRoot): void {
    const parentObject = root.findByCreatedAt(this.getParentCreatedAt());
    if (parentObject instanceof PlainText) {
      const text = parentObject as PlainText;
      text.selectInternal([this.fromPos, this.toPos], this.getExecutedAt());
    } else if (parentObject instanceof RichText) {
      const text = parentObject as RichText;
      text.selectInternal([this.fromPos, this.toPos], this.getExecutedAt());
    } else {
      if (!parentObject) {
        logger.fatal(`fail to find ${this.getParentCreatedAt()}`);
      }

      logger.fatal(
        `fail to execute, only PlainText, RichText can execute select`,
      );
    }
  }

  /**
   * `getEffectedCreatedAt` returns the time of the effected element.
   */
  public getEffectedCreatedAt(): TimeTicket {
    return this.getParentCreatedAt();
  }

  /**
   * `getAnnotatedString` returns a string containing the meta data.
   */
  public getAnnotatedString(): string {
    const parent = this.getParentCreatedAt().getAnnotatedString();
    const fromPos = this.fromPos.getAnnotatedString();
    const toPos = this.toPos.getAnnotatedString();
    return `${parent}.SELT(${fromPos},${toPos})`;
  }

  /**
   * `getFromPos` returns the start point of the editing range.
   */
  public getFromPos(): RGATreeSplitNodePos {
    return this.fromPos;
  }

  /**
   * `getToPos` returns the end point of the editing range.
   */
  public getToPos(): RGATreeSplitNodePos {
    return this.toPos;
  }
}
