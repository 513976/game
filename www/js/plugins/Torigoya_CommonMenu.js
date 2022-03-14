/*---------------------------------------------------------------------------*
 * Torigoya_CommonMenu.js v.1.0.0
 *---------------------------------------------------------------------------*
 * 2020/09/02 22:13 (JST)
 *---------------------------------------------------------------------------*
 * Ruたん ( @ru_shalm )
 * https://torigoya-plugin.rutan.dev
 *---------------------------------------------------------------------------*/

/*:
 * @target MV
 * @plugindesc メニューからコモンイベント呼び出しプラグイン (v.1.0.0)
 * @author Ruたん（ru_shalm）
 * @license public domain
 * @version 1.0.0
 * @url https://raw.githubusercontent.com/rutan/torigoya-rpg-maker-plugin/gh-pages/Torigoya_CommonMenu.js
 * @help
 * メニューからコモンイベント呼び出しプラグイン (v.1.0.0)
 *
 * メニューにコモンイベントを呼び出す項目を追加します
 *
 * ------------------------------------------------------------
 * ■ 設定方法
 * ------------------------------------------------------------
 *
 * このプラグインの設定からメニュー項目を登録してください。
 * ここでの並び順の順番で画面に表示されます。
 *
 * @param base
 * @text ■ 基本設定
 *
 * @param baseItems
 * @text メニューに追加する項目
 * @type struct<MenuItem>[]
 * @parent base
 * @default ["{\"name\": \"コモンイベント\",\"commonEvent\": \"1\",\"switchId\": \"0\",\"visibility\": \"true\",\"note\": \"\"}"]
 */

/*~struct~MenuItem:
 * @param name
 * @text 項目名
 * @desc メニューに表示される項目の名前
 * @type string
 * @default
 *
 * @param commonEvent
 * @text 呼び出すコモンイベント
 * @desc メニュー選択時に呼び出すコモンイベント
 * @type common_event
 * @default 0
 *
 * @param switchId
 * @text 有効スイッチ
 * @desc このスイッチがONのときのみ選択できるようにします
 * なしの場合は、常に選択できます
 * @type switch
 * @default 0
 *
 * @param visibility
 * @text 無効時に表示するか
 * @desc 有効スイッチがONじゃないときに
 * 項目をメニューに表示するか設定できます
 * @type boolean
 * @on 表示する
 * @off 表示しない
 * @default true
 *
 * @param note
 * @text メモ
 * @desc メモ欄です。
 * ツクールのメモ欄同様に使えます。
 * @type note
 * @default
 */

(function () {
    'use strict';

    const Torigoya = (window.Torigoya = window.Torigoya || {});

    function getPluginName() {
        const cs = document.currentScript;
        return cs ? cs.src.split('/').pop().replace(/\.js$/, '') : 'Torigoya_CommonMenu';
    }

    function pickStringValueFromParameter(parameter, key) {
        return ''.concat(parameter[key] || '');
    }

    function pickIntegerValueFromParameter(parameter, key) {
        return parseInt(parameter[key], 10);
    }

    function pickBooleanValueFromParameter(parameter, key) {
        return ''.concat(parameter[key]) === 'true';
    }

    function pickJsonValueFromParameter(parameter, key) {
        if (!parameter[key]) return parameter[key];
        return JsonEx.parse(parameter[key]);
    }

    function readParameter() {
        const parameter = PluginManager.parameters(getPluginName());
        return {
            version: '1.0.0',
            baseItems: ((parameters) => {
                if (typeof parameters === 'string') parameters = JSON.parse(parameters);
                return parameters.map((parameter) => {
                    if (typeof parameter === 'string') parameter = JSON.parse(parameter);
                    return {
                        name: pickStringValueFromParameter(parameter, 'name'),
                        commonEvent: pickIntegerValueFromParameter(parameter, 'commonEvent'),
                        switchId: pickIntegerValueFromParameter(parameter, 'switchId'),
                        visibility: pickBooleanValueFromParameter(parameter, 'visibility'),
                        note: pickJsonValueFromParameter(parameter, 'note'),
                    };
                });
            })(parameter.baseItems),
        };
    }

    Torigoya.CommonMenu = {
        name: getPluginName(),
        parameter: readParameter(),
    };

    (() => {
        const upstream_Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function () {
            upstream_Window_MenuCommand_addOriginalCommands.apply(this);

            Torigoya.CommonMenu.parameter.baseItems.forEach((item, i) => {
                const enabled = item.switchId ? $gameSwitches.value(parseInt(item.switchId, 10)) : true;
                if (!enabled && !item.visibility) return;
                this.addCommand(item.name, 'TorigoyaCommonMenu_'.concat(i), enabled);
            });
        };

        const upstream_Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function () {
            upstream_Scene_Menu_createCommandWindow.apply(this);

            Torigoya.CommonMenu.parameter.baseItems.forEach((item, i) => {
                const id = parseInt(item.commonEvent, 10);
                if (!id) return;

                this._commandWindow.setHandler('TorigoyaCommonMenu_'.concat(i), () => {
                    $gameTemp.reserveCommonEvent(id);
                    SceneManager.goto(Scene_Map);
                });
            });
        };
    })();
})();
