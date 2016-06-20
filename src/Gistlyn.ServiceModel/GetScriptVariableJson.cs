﻿using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class GetScriptVariableJson : IReturn<ScriptVariableJson>
    {
        public string ScriptId { get; set; }

        public string VariableName { get; set; }
    }
}

