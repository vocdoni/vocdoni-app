import { MultiLanguage } from '../../util/lang';
import {
  checkValidElectionMetadata,
  Choice,
  ElectionMetadata,
  getElectionMetadataTemplate,
  IChoice,
  IQuestion,
} from '../metadata';
import invariant from 'tiny-invariant';
import { Census } from '../census';
import { Election, CustomMeta, IElectionParameters, IElectionType, IVoteType } from './election';
import { SDK_VERSION } from '../../version';
import { Asymmetric } from '../../util/encryption';

/**
 * Represents an unpublished election
 */
export class UnpublishedElection extends Election {
  /**
   * Constructs an unpublished election
   *
   * @param params - Election parameters
   */
  public constructor(params: IElectionParameters) {
    super();
    this.title = typeof params.title === 'string' ? { default: params.title } : params.title;
    this.description = typeof params.description === 'string' ? { default: params.description } : params.description;
    this.header = params.header;
    this.streamUri = params.streamUri;
    this.meta = params.meta;
    this.startDate = params.startDate ? new Date(params.startDate) : null;
    this.endDate = new Date(params.endDate);
    this.census = params.census;
    this.electionType = UnpublishedElection.fullElectionType(params.electionType);
    this.voteType = UnpublishedElection.fullVoteType(params.voteType);
    this.questions = params.questions ?? [];
    this.maxCensusSize = params.maxCensusSize;
    this.temporarySecretIdentity = params.temporarySecretIdentity;
    this.addSDKVersion = params.addSDKVersion ?? true;
  }

  public addQuestion(
    title: string | MultiLanguage<string>,
    description: string | MultiLanguage<string>,
    choices: Array<{ title: string; value?: number; meta?: CustomMeta } | Choice>,
    meta?: CustomMeta
  ): UnpublishedElection {
    this._questions.push({
      title: typeof title === 'string' ? { default: title } : title,
      description: typeof description === 'string' ? { default: description } : description,
      choices: choices.map((choice, index) => {
        return {
          title: typeof choice.title === 'string' ? { default: choice.title } : choice.title,
          value: choice.value ?? index,
          ...(choice.meta && { meta: choice.meta }),
        } as IChoice;
      }),
      ...(meta && { meta: meta }),
    });

    return this;
  }

  public removeQuestion(questionNumber: number): UnpublishedElection {
    invariant(this._questions[questionNumber - 1], 'Question cannot be removed');
    this._questions.splice(questionNumber - 1, 1);
    return this;
  }

  private static fullElectionType(value: IElectionType): IElectionType {
    return {
      interruptible: typeof value?.interruptible === 'boolean' ? value.interruptible === true : true,
      dynamicCensus: typeof value?.dynamicCensus === 'boolean' ? value.dynamicCensus === true : false,
      secretUntilTheEnd: typeof value?.secretUntilTheEnd === 'boolean' ? value.secretUntilTheEnd === true : false,
      anonymous: typeof value?.anonymous === 'boolean' ? value.anonymous === true : false,
      metadata: {
        encrypted: typeof value?.metadata?.encrypted === 'boolean' ? value.metadata.encrypted === true : false,
        password: typeof value?.metadata?.password === 'string' ? value.metadata.password : null,
      },
    };
  }

  private static fullVoteType(value: IVoteType): IVoteType {
    return {
      uniqueChoices: typeof value?.uniqueChoices === 'boolean' ? value.uniqueChoices === true : false,
      maxVoteOverwrites: typeof value?.maxVoteOverwrites === 'number' ? value.maxVoteOverwrites : 0,
      costFromWeight: typeof value?.costFromWeight === 'boolean' ? value.costFromWeight === true : false,
      costExponent: typeof value?.costExponent === 'number' ? value.costExponent : 1,
      maxValue: typeof value?.maxValue === 'number' ? value.maxValue : null,
      maxCount: typeof value?.maxCount === 'number' ? value.maxCount : null,
      maxTotalCost: typeof value?.maxCount === 'number' ? value.maxTotalCost : null,
    };
  }

  public generateMetadata(metadata?: ElectionMetadata): ElectionMetadata {
    if (!metadata) {
      metadata = getElectionMetadataTemplate();
    }

    metadata.title = this.title;
    metadata.description = this.description;
    metadata.media = {
      header: this.header,
      streamUri: this.streamUri,
    };
    metadata.meta = this.meta ?? {};
    if (this.addSDKVersion) {
      metadata.meta.sdk = {
        version: SDK_VERSION,
      };
    }
    metadata.questions = this.questions.map((question) => {
      return {
        title: question.title,
        description: question.description,
        meta: question.meta,
        choices: question.choices.map((choice) => {
          return {
            title: choice.title,
            value: choice.value,
            meta: choice.meta,
          };
        }),
      };
    });

    checkValidElectionMetadata(metadata);

    return metadata;
  }

  public summarizeMetadata(): string {
    const metadata = JSON.stringify(this.generateMetadata());
    return this.electionType.metadata?.encrypted
      ? Asymmetric.encryptBox(metadata, this.electionType.metadata?.password)
      : metadata;
  }

  public generateVoteOptions(): object {
    const maxCount = this.voteType.maxCount ?? this.questions.length;
    const maxValue =
      this.voteType.maxValue ??
      this.questions.reduce((prev, cur) => {
        const localMax = cur.choices.length - 1;
        return localMax > prev ? localMax : prev;
      }, 0);
    const maxVoteOverwrites = this.voteType.maxVoteOverwrites;
    const maxTotalCost = this.voteType.maxTotalCost ?? 0;
    const costExponent = this.voteType.costExponent;

    return { maxCount, maxValue, maxVoteOverwrites, maxTotalCost, costExponent };
  }

  get duration(): number {
    return this.startDate
      ? Math.floor((this.endDate.getTime() - this.startDate.getTime()) / 1000)
      : Math.floor((this.endDate.getTime() - Date.now()) / 1000);
  }

  public generateEnvelopeType(): object {
    const serial = false; // TODO
    const anonymous = this.electionType.anonymous;
    const encryptedVotes = this.electionType.secretUntilTheEnd;
    const uniqueValues = this.voteType.uniqueChoices;
    const costFromWeight = this.voteType.costFromWeight;

    return { serial, anonymous, encryptedVotes, uniqueValues, costFromWeight };
  }

  public generateMode(): object {
    const interruptible = this.electionType.interruptible;
    const dynamicCensus = this.electionType.dynamicCensus;
    const encryptedMetaData = this.electionType.metadata?.encrypted ?? false;
    const preRegister = false; // TODO

    return { interruptible, dynamicCensus, encryptedMetaData, preRegister };
  }

  get title(): MultiLanguage<string> {
    return super.title;
  }

  set title(value: MultiLanguage<string>) {
    invariant(value?.default.length > 0, 'Title is not set');
    this._title = value;
  }

  get description(): MultiLanguage<string> {
    return super.description;
  }

  set description(value: MultiLanguage<string>) {
    this._description = value;
  }

  get header(): string {
    return super.header;
  }

  set header(value: string) {
    this._header = value;
  }

  get streamUri(): string {
    return super.streamUri;
  }

  set streamUri(value: string) {
    this._streamUri = value;
  }

  get meta(): CustomMeta {
    return super.meta;
  }

  set meta(value: CustomMeta) {
    invariant(!value || value['sdk'] === undefined, 'Field `sdk` is restricted in metadata');
    this._meta = value;
  }

  get startDate(): Date {
    return super.startDate;
  }

  set startDate(value: Date) {
    invariant(!value || !isNaN(value.getTime()), 'Invalid start date');
    this._startDate = value;
  }

  get endDate(): Date {
    return super.endDate;
  }

  set endDate(value: Date) {
    invariant(!isNaN(value.getTime()), 'Invalid end date');
    invariant(value.getTime() > (this._startDate?.getTime() ?? 0), 'The end date cannot be prior to the start date');
    this._endDate = value;
  }

  get electionType(): IElectionType {
    return super.electionType;
  }

  set electionType(value: IElectionType) {
    this._electionType = UnpublishedElection.fullElectionType(value);
  }

  get voteType(): IVoteType {
    return super.voteType;
  }

  set voteType(value: IVoteType) {
    this._voteType = UnpublishedElection.fullVoteType(value);
  }

  get questions(): IQuestion[] {
    return super.questions;
  }

  set questions(value: IQuestion[]) {
    this._questions = value;
  }

  get census(): Census {
    return super.census;
  }

  set census(value: Census) {
    invariant(value instanceof Census, 'Invalid census');
    this._census = value;
  }

  get maxCensusSize(): number {
    return super.maxCensusSize;
  }

  set maxCensusSize(value: number) {
    invariant(value == null || value > 0, 'Maximum census size cannot be zero or negative');
    this._maxCensusSize = value;
  }

  get temporarySecretIdentity(): boolean {
    return super.temporarySecretIdentity;
  }

  set temporarySecretIdentity(value: boolean) {
    this._temporarySecretIdentity = value;
  }

  get addSDKVersion(): boolean {
    return super.addSDKVersion;
  }

  set addSDKVersion(value: boolean) {
    this._addSDKVersion = value;
  }
}
