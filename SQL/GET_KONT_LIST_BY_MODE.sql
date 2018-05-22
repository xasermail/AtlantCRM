-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 04.01.2017
-- Description:	���������� ������ ��������� � ��������� ������
-- 1 - �� ����������
-- 2 - ������� (��� ����)
-- 3 - ��������������� (������ �� �������)
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_KONT_LIST_BY_MODE') drop procedure dbo.GET_KONT_LIST_BY_MODE;

GO

create procedure [dbo].[GET_KONT_LIST_BY_MODE]
@m_org_id int,
@page int,
@rows_per_page int,
@mode int,

-- ID ��������, ������� ���� ���������� ������ � ������, ������������ ��� ������ �� �� ���������
@o_kont_ank_id_search int = -1,

-- ��������� ��� ������ ������ �� ���������������, �������� O_REK_ANK.ID ��������,
-- �������� ���� ���������� � ����������� ������, �� ������ ���� � ����� �����
@o_rek_ank_id_search int = -1,

-- ������ �� �� ���������, ������ ��������
@nePrFilterM_KONT_STATUS_ID int = null,
-- ������ �� �� ���������, �������� ��������
@nePrFilterM_KONT_IST_ID int = null,

-- ����������� ���������� �� ���� ���� ������, ��� �� ���������
-- 0 - ��� ����������, 1 - �����������, 2 - ��������
@nePrOrderByD_ZV int = 0

AS	 
BEGIN
/*
	declare @m_org_id int
	set @m_org_id = 1
	declare @page int 
	set @page = 1
	declare @rows_per_page int
	set @rows_per_page = 6
	declare @mode int
	set @mode = 3
--*/
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @hidedKontact int
	set @hidedKontact = 2

	declare @MODE_NOT_CAME int = 1 -- �� ��������� 
	declare @MODE_HIDE int = 2  -- �������
	declare @MODE_REC int = 3  -- ���������������

  -- ������ �������� "<�������� ������>"
  declare @M_KONT_STATUS_ID_VIBERITE_STATUS int = 1;
  -- ������ �������� "������"
  declare @M_KONT_STATUS_ID_SROCHNO int = 2;

  -- �������� �������� "<�������� ������>"
  declare @M_KONT_IST_ID_VIBERITE_STATUS int = 1;

	declare @curDate smalldatetime
	set @curDate = cast(GETDATE() as date)

	declare @cnt int;

  -- �������� ���������������
	if @mode = @MODE_REC
	begin

    -- ������� ������ ���������� �������
		select
      @cnt = count(*)
		from	O_REK_ANK as s
		where	s.M_ORG_ID = @m_org_id
				and s.SKR = 0
				and s.O_ANK_ID is null
    ;

	  select
       -1 as KONT_SEANS_ID
			,s.ID as KONT_ID
			,s.SURNAME
			,s.[NAME]
			,s.SECNAME
			,s.PHONE
			,'' as SEANS
			,null as D_ZV 
			,'' as COMMENT
			,-1 as M_SEANS_TIME_ID
			,s.SKR
			,@cnt as COUNT_ALL
      -- � ��������������� ��� ������� ��������
      ,@M_KONT_STATUS_ID_VIBERITE_STATUS M_KONT_STATUS_ID
      ,'<�� �����>' M_KONT_STATUS_ID_NAME
      -- � ��������������� ��� ��������� ��������
      ,@M_KONT_IST_ID_VIBERITE_STATUS M_KONT_IST_ID
      ,'<�� �����>' M_KONT_IST_ID_NAME
	  from
      O_REK_ANK as s
	  where
      s.M_ORG_ID = @m_org_id
		  and s.SKR = 0
		  and s.O_ANK_ID is null
	  order by
      -- ����� ������ ������ ��������� �������, �� ��������
      -- ��� ����� (�����������)
      case when s.ID = @o_rek_ank_id_search then - 1 else s.ID end
	  offset
	    (@page - 1) * @rows_per_page rows
	  fetch next
	    @rows_per_page rows only
    ;

  -- �������� �� ��������� � �������
	end else begin

    -- ������� ������ ���������� �������
		select @cnt = count(*)
		from
      dbo.O_KONT_SEANS as s
			join dbo.O_KONT_ANK as a on a.ID = s.O_KONT_ANK_ID
			left join dbo.M_SEANS_TIME as st on st.ID = s.M_SEANS_TIME_ID
		where
/* !!!  ��� ���������� ������� ����, ����� �� ������� ���� �������� � ������ ���� */
        s.M_ORG_ID = @m_org_id
				and 
				(
					(@mode = @MODE_HIDE and a.SKR > 0)
					or
					(@mode = @MODE_NOT_CAME and a.SKR = 0 and (s.SEANS_DATE < @curDate or a.SOZD_NEPR = 1))
				)
        -- ������ �� ������ �� ���������
        and (
          (
            @mode = @MODE_NOT_CAME
            and (@nePrFilterM_KONT_STATUS_ID is null or a.M_KONT_STATUS_ID = @nePrFilterM_KONT_STATUS_ID)
            and (@nePrFilterM_KONT_IST_ID is null or a.M_KONT_IST_ID = @nePrFilterM_KONT_IST_ID)
          )
          or
          @mode <> @MODE_NOT_CAME
        )
    ;

		select
       s.ID as KONT_SEANS_ID
			,a.ID as KONT_ID
			,a.SURNAME
			,a.[NAME]
			,a.SECNAME
			,a.PHONE
			,format(s.SEANS_DATE, 'dd.MM.yyyy')+' ' +st.[NAME] as SEANS
			,s.D_ZV 
      -- ������������ ����� ���� �����, ��� ����������� ��������� ���������,
      -- ��� ����������� ���������� � ������ �������, ��� ���������� ����������
			,(select top 1 sc.COMMENT from dbo.O_KONT_SEANS_COMMENT sc where sc.O_KONT_SEANS_ID = s.ID order by sc.ID desc) COMMENT
			,s.M_SEANS_TIME_ID
			,a.SKR
			,@cnt as COUNT_ALL
      ,a.M_KONT_STATUS_ID
      ,case when a.M_KONT_STATUS_ID = @M_KONT_STATUS_ID_VIBERITE_STATUS then '' else kst.[NAME] end M_KONT_STATUS_ID_NAME
      ,a.M_KONT_IST_ID
      ,case when a.M_KONT_IST_ID = @M_KONT_IST_ID_VIBERITE_STATUS then '' else kist.[NAME] end M_KONT_IST_ID_NAME
		from
      dbo.O_KONT_SEANS as s
		  join dbo.O_KONT_ANK as a on a.ID = s.O_KONT_ANK_ID
			left join dbo.M_SEANS_TIME as st on st.ID = s.M_SEANS_TIME_ID
      left join dbo.M_KONT_STATUS kst on kst.ID = a.M_KONT_STATUS_ID
      left join dbo.M_KONT_IST kist on kist.ID = a.M_KONT_IST_ID
		where
/* !!!  ��� ���������� ������� ����, ����� �� ������� ���� �������� � ������ ���� */
        s.M_ORG_ID = @m_org_id
				and 
				(
					(@mode = @MODE_HIDE and a.SKR > 0)
					or
					(@mode = @MODE_NOT_CAME and a.SKR = 0 and (s.SEANS_DATE < @curDate or a.SOZD_NEPR = 1))
				)
        -- ������ �� ������ �� ���������
        and (
          (
            @mode = @MODE_NOT_CAME
            and (@nePrFilterM_KONT_STATUS_ID is null or a.M_KONT_STATUS_ID = @nePrFilterM_KONT_STATUS_ID)
            and (@nePrFilterM_KONT_IST_ID is null or a.M_KONT_IST_ID = @nePrFilterM_KONT_IST_ID)
          )
          or
          @mode <> @MODE_NOT_CAME
        )
		order by

      case when @mode = @MODE_NOT_CAME and a.ID = @o_kont_ank_id_search then 1 else 2 end

      -- ��� ������ �� ��������� ������� ����������� ���������� �� ���� ���� ������,
      -- 0 - ��� ����������, 1 - �� �����������, 2 - �� ��������
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV = 0 then 0 else 0 end
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV = 1 then s.D_ZV else 0 end asc
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV =2 then s.D_ZV else 0 end desc

      -- ��� ������ �� ��������� �� �������� � ������� ������ "������" ������ ���������� ������, ��������� ����
      ,case
        when @mode = @MODE_NOT_CAME then
          case when a.M_KONT_STATUS_ID = @M_KONT_STATUS_ID_SROCHNO
            then 1
            else 2
          end
        -- ��� ������ ������� �� ���������
        else 0 
      end,

      -- ��� ������ �� ���������, �� ��������� ��������� �� ���������� ������ ������������ ���� ���������
      case when @mode = @MODE_NOT_CAME and a.SOZD_NEPR = 1 then 1 else 2 end,
      -- � ��������� ��������� � ����� �����
      case when @mode = @MODE_NOT_CAME and a.SOZD_NEPR = 1 then a.D_START else 0 end desc,

      s.ID

		offset
		  (@page - 1) * @rows_per_page rows
		fetch next
		  @rows_per_page rows only

	end; -- else 

END; -- proc

go

set dateformat dmy;
exec [dbo].[GET_KONT_LIST_BY_MODE]
  @m_org_id = 2,
  @page = 1,
  @rows_per_page = 20,
  @mode = 1,
  @o_kont_ank_id_search = 4733,
  @nePrFilterM_KONT_STATUS_ID = null,
  @nePrFilterM_KONT_IST_ID = null,
  @nePrOrderByD_ZV = 0
;