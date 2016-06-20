﻿using System;
using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class RunMultipleScripts : IReturn<RunMultipleScriptResponse>
    {
        public string ScriptId { get; set; }

        public string MainCode { get; set; }

        public List<string> Scripts { get; set; }

        public List<AssemblyReference> References { get; set; }

        public string Packages { get; set; }

        public bool ForceRun { get; set; }
    }

    public class RunMultipleScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }

        public List<AssemblyReference> References { get; set; }
    }
}

