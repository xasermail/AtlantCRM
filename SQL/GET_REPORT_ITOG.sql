if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_ITOG') drop procedure dbo.GET_REPORT_ITOG;

GO

-- =============================================
-- Author:		Maynskiy
-- Create date: 02-05-2017
-- Description:	������ ��� ������ ����
--
-- 2018-05-09 ������ ����������, ��������� ���������
-- =============================================
create procedure [dbo].[GET_REPORT_ITOG]
	 @fromDate smalldatetime
	,@toDate smalldatetime
	,@m_org_id int 
AS
BEGIN

set datefirst 1;
set nocount on;
set ansi_warnings off;

-- ������ ������������� ������
declare @SEANS_STATE_SOSTOYALSYA int = 1;	


-- ������������ ����� ��������� � ������, ��, ��� ������ ��� ����� ������ � ���� �������
declare @max_posesch_nomer int = 21;
-- ��������� �������������� �������
declare @result table(VAL int, COUNT_SEANS int, COUNT_BUY int)

-- ��������� ������� ������� �������� � �������� ���������
declare @i int = 1;
while(@i <= @max_posesch_nomer)
begin
	insert into @result(VAL, COUNT_SEANS, COUNT_BUY)
	values (@i, 0, 0)
	set @i = @i + 1;
end;

-- ������������� ������, ����� ���� � ������ �������� ��������� �������� � ��������
-- �������� � ������� ������� ��� �������
declare @t table (o_ank_id int, dt date, nomerPosesch int, kolvoPokupokVPosesch int);
insert into @t(o_ank_id, dt, nomerPosesch, kolvoPokupokVPosesch)
select
  o.O_ANK_ID,
  cast(isnull(o.D_REG, o.D_START) as date) dt,
  -- ����� ��������� ���������� �� �����: ������� ��������� ���� �� ������
  -- ��������� ������� ���� ����� ��������� ������ ��������� �������
  --
  -- ������� ��������� ���� �� ������ ��������� �������
  (
    select
      count(*)
    from
      dbo.O_SEANS u
    where
      u.O_ANK_ID = o.O_ANK_ID and
      u.M_ORG_ID = @m_org_id and
      u.SEANS_STATE = @SEANS_STATE_SOSTOYALSYA and 
      cast(isnull(u.D_REG, u.D_START) as date) < @fromDate
  ) 
  +
  -- ��������� ��������� ������ ��������� �������, ������� � �������
  row_number() over(partition by o.O_ANK_ID order by cast(isnull(o.D_REG, o.D_START) as date)) nomerPosesch,
  -- ���������� ����������� ������� � ���� ���������
  (
    select
      count(*)
    from
      dbo.O_SKLAD_RAS r
      join dbo.O_SKLAD_RAS_PRODUCT x on x.O_SKLAD_RAS_ID = r.ID
    where
      x.M_ORG_ID = @m_org_id and
      r.O_ANK_ID = o.O_ANK_ID and
      x.OPL_OST = 0 and
      x.COST > 0 and -- ������� �������
      x.D_VID = cast(isnull(o.D_REG, o.D_START) as date)
  ) kolvoPokupokVPosesch
from
  dbo.O_SEANS o
where
  o.M_ORG_ID = @m_org_id and
  o.SEANS_STATE = @SEANS_STATE_SOSTOYALSYA and 
  cast(isnull(o.D_REG, o.D_START) as date) between @fromDate and @toDate
;

-- ��� ��������� ������� � 21�� ������ ������� � ���� �������� ������� "����� 20"
update
  t
set
  t.nomerPosesch = @max_posesch_nomer
from
  @t t
where
  t.nomerPosesch >= @max_posesch_nomer
;

-- ����� ����������
select
  r.VAL,
  count(t.o_ank_id) COUNT_SEANS,
  isnull(sum(t.kolvoPokupokVPosesch), 0) COUNT_BUY
from
  @result r
  left join @t t on t.nomerPosesch = r.VAL
group by
  r.VAL
order by
  r.VAL
;

end; -- proc

GO


set dateformat dmy;
declare @fromDate smalldatetime;
declare @toDate smalldatetime;
declare @m_org_id int;
set @fromDate = cast('01.04.2018' as date);
set @toDate = cast('01.05.2018' as date);
set @m_org_id = 26;
exec [dbo].[GET_REPORT_ITOG] @fromDate, @toDate, @m_org_id;